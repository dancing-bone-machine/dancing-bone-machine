/*
    Copyright (c) 2013 Rafael Vega González <rvega@elsoftwarehamuerto.org>

    This file is part of Dancing Bone Machine.

    Dancing Bone Machine is free software; you can redistribute it and/or modify it under
    the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    Dancing Bone Machine is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
*/

#include <libwebsockets.h>
#include <modp_numtoa.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <pthread.h>

#include "m_pd.h"
#include "s_stuff.h"

#define MAX_MESSAGE_SIZE 20000

/**
 * Datasructure to hold the instance variables for each websocket_server
 * object
 */
typedef struct websocket_server {
   t_object x_obj;

   int port_number;
   struct libwebsocket_context *context;
   pthread_t server_thread;
   pthread_mutex_t message_mutex;

   char message[LWS_SEND_BUFFER_PRE_PADDING + MAX_MESSAGE_SIZE + LWS_SEND_BUFFER_POST_PADDING]; // buffer needs space for pre and post padding that libwebsockets will add when sending.
   int need_to_send;
   int need_to_send_array;
   t_garray *array;
   char array_name[MAXPDSTRING];
   t_outlet *outlet;
} t_websocket_server;

/** 
 * Holds our class
 */
t_class *websocket_server_class;

/**
 * Runs in a separate thread. Polls the websocket server for work
 */
static void* websocket_server_tick(void* param){
   t_websocket_server* x = (t_websocket_server*)param;
   while(1){
      pthread_testcancel();
      libwebsocket_service(x->context, 0);
      usleep(100);
   }
   return NULL;
}

/**
 * Checks if a string holds a numeric (float) value
 */
static int websockets_server_is_numeric(char* str){
   double value = atof(str);
   if(value != 0){
      return 1; 
   }
   if(value == 0 && str[0]=='0' && str[strlen(str)-1]=='0'){
      return 1; 
   }
   return 0;
}

/**
 * Called when websocket server receives a pd-websocket request or when it needs to send data
 */
static int websocket_server_callback_pd(struct libwebsocket_context * this, struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason, void *user, void *in, size_t len) { 
   t_websocket_server* x = libwebsocket_context_user(this);
   switch (reason) {
      case LWS_CALLBACK_ESTABLISHED:
         libwebsocket_callback_on_writable(this, wsi);
         post("websockets_server: Connection established.");
         break;
      case LWS_CALLBACK_RECEIVE: {
         // Split input by spaces, put pieces in output_list 
         // (its an array of symbols)
         t_atom output_list[128];
         char* input = (char*)in;
         char* token = strtok(input, " ");
         int i = 0;
         while(token != NULL){
            if(websockets_server_is_numeric(token)){
               SETFLOAT(output_list + i, atof(token));
            }
            else{
               SETSYMBOL(output_list + i, gensym(token));
            }
            token = strtok(NULL, " ");
            i++;
         }

         // output the list
         outlet_list(x->outlet, 0, i, output_list);
         break;
      }
      case LWS_CALLBACK_SERVER_WRITEABLE: {
         if(!x->need_to_send && !x->need_to_send_array) {
            libwebsocket_callback_on_writable(this, wsi);
            return 0;
         }
           
         if(x->need_to_send_array){
            t_word *array_contents = ((t_word *) garray_vec(x->array));

            // Assemble the message
            char* msg = &(x->message[LWS_SEND_BUFFER_PRE_PADDING]);
            strcpy(msg, "dbm-read-array ");
            strcat(msg, x->array_name);
            strcat(msg, " ");
            char str[MAXPDSTRING] = "";
            int i;
            for (i=0; i<garray_npoints(x->array); i++) {
               modp_dtoa(array_contents[i].w_float, str, 6); // This is a faster equivalent to snprintf(str, MAXPDSTRING, "%f", array_contents[i].w_float);
               if(strlen(msg) + strlen(str) >= MAX_MESSAGE_SIZE){
                  error("websockets_server: message too long, truncating.");
                  break;
               }
               strcat(msg, str);
               strcat(msg, " ");
            }
            msg[strlen(msg)-1]=0; // remove trailing space
            int length = strlen(msg);
            libwebsocket_write(wsi, (unsigned char*)msg, length, LWS_WRITE_TEXT);
            x->need_to_send_array = 0;
            pthread_mutex_unlock(&(x->message_mutex));
         } 
         
         if(x->need_to_send) {
            // send our asynchronous message
            int length = strlen(&(x->message[LWS_SEND_BUFFER_PRE_PADDING]));
            libwebsocket_write(wsi, (unsigned char*)&(x->message[LWS_SEND_BUFFER_PRE_PADDING]), length, LWS_WRITE_TEXT);
            x->need_to_send = 0;
            pthread_mutex_unlock(&(x->message_mutex));
         }

         libwebsocket_callback_on_writable(this, wsi);
         break;
      }
      default:
         break;
   }
   return 0;

   // Silence unused param warnings.
   (void)user;
   (void)len;
} 

/**
 * Called when websockets server receives a plain http request, do nothing.
 */
static int websocket_server_callback_http(struct libwebsocket_context * this, struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason, void *user, void *in, size_t len) { 
   return 0;

   // Silence unused param warnings.
   (void)(this);
   (void)wsi;
   (void)reason;
   (void)user;
   (void)in;
   (void)len;
}

/**
 * The protocols that our server understands
 */
static struct libwebsocket_protocols websocket_server_protocols[] = {
   // Syntax is: {"protocol-name", callback, per_session_data_size}. 
   // First protocol must always be HTTP handler
   {"http-only", websocket_server_callback_http, 0, 0, 0, 0},
   {"pd-websocket", websocket_server_callback_pd, 0, 0, 0, 0},
   {NULL, NULL, 0, 0, 0, 0} // End of list
};

/**
 * Constructor
 */
static void *websocket_server_new(t_floatarg port_number) {
   t_websocket_server *x = (t_websocket_server *)pd_new(websocket_server_class); 
   x->port_number = port_number;
   x->outlet = outlet_new(&x->x_obj, &s_anything);
   x->need_to_send = 0;
   x->need_to_send_array = 0;
   strcpy(x->message, "");
   strcpy(x->array_name, "");
   return (void *)x;
}

/**
 * Destructor
 */
static void websocket_server_free(t_websocket_server *x) {
   if(x->context != NULL){
      libwebsocket_context_destroy(x->context);
      x->context = NULL;
   }
   while(pthread_cancel(x->server_thread) < 0);
   pthread_mutex_destroy(&(x->message_mutex));
}

/**
 * Called when a "send_array" message is received
 */
static void websocket_server_send_array(t_websocket_server *x, t_symbol *s){
   if(x->context == NULL){
      error("websockets_server: you must establish a connection before sending an array");
      return;
   }

   if(pthread_mutex_trylock(&(x->message_mutex))){
      error("websockets_server: sorry, I can only send one message at the same time.");
      return;
   }

   strcpy(x->array_name, s->s_name);
   t_garray *array;
   if(!(array = (t_garray *)pd_findbyclass(s, garray_class))) {
      pd_error(x, "websockets_server: %s: no such array", x->array_name);
      return;
   } 
   x->array = array;
   x->need_to_send_array = 1;
}

/**
 * Called when a "send" message is received
 */
static void websocket_server_send(t_websocket_server *x, t_symbol *s, int argc, t_atom *argv) {
   if(x->context == NULL){
      error("websockets_server: you must establish a connection before sending a message");
      return;
   }

   if(pthread_mutex_trylock(&(x->message_mutex))){
      error("websockets_server: sorry, I can only send one message at the same time.");
      return;
   }

   char msg[MAX_MESSAGE_SIZE] = "";
   char str[MAXPDSTRING] = "";
   int i=0;
   for(i=0; i<argc; i++){
      atom_string(argv+i, str, MAXPDSTRING);
      strcat(msg, str);
      strcat(msg, " ");
   }
   msg[strlen(msg)-1]=0; // remove trailing space
   strcpy(&(x->message[LWS_SEND_BUFFER_PRE_PADDING]), msg); // Copy the message into the x->message buffer, leaving space for the pre padding needed by libwebsockets.
   x->need_to_send = 1;

   // Silence unused paramater warning
   (void)s;
}

/**
 * Called when a "connect" message is received
 */
static void websocket_server_connect(t_websocket_server *x, t_floatarg port_number) {
   if(port_number==0.0 && x->port_number==0.0){
      error("websocket_server: you must specify a port number.");
      return;
   }

   if(port_number != 0.0){
      x->port_number = port_number;
   } 

   websocket_server_free(x);

   // create libwebsocket context to represent this server
   struct lws_context_creation_info info;
   memset(&info, 0, sizeof info);
   info.user = x;
   info.port = x->port_number;
   info.iface = NULL;
   info.protocols = websocket_server_protocols;
   info.extensions = libwebsocket_get_internal_extensions();
   info.ssl_cert_filepath = NULL;
   info.ssl_private_key_filepath = NULL;
   info.gid = -1;
   info.uid = -1;
   info.options = 0;

   x->context = libwebsocket_create_context(&info);
   if (x->context == NULL) {
      error("websockets_server: Could not create websocket server at port %i.", x->port_number);
      return;
   }

   pthread_mutex_init(&(x->message_mutex), NULL);
   pthread_create(&x->server_thread, NULL, websocket_server_tick, x);

   post("websockets_server: Listening to port %i.", x->port_number);
}

/**
 * Called once at setup time, this is where we declare the 
 * websocket_server class
 */
extern void websocket_server_setup(void) {
   // Declare class, constructor and destructor. 
   // Constructor receives one float parameter
   websocket_server_class = class_new(gensym("websocket_server"), (t_newmethod)websocket_server_new, (t_method)websocket_server_free, sizeof(t_websocket_server), 0, A_DEFFLOAT, 0);

   // Add "connect" method, will fire when a "connect" message is received.
   // Has float parameter
   class_addmethod(websocket_server_class, (t_method)websocket_server_connect, gensym("connect"), A_DEFFLOAT, 0);

   // Add "send" method, will fire when a "send" message is received.
   // Has float parameter
   class_addmethod(websocket_server_class, (t_method)websocket_server_send, gensym("send"), A_GIMME, 0);
   
   // Add "send_array" method, will fire when a "send_array" message is received.
   // Has symbol parameter
   class_addmethod(websocket_server_class, (t_method)websocket_server_send_array, gensym("send-array"), A_SYMBOL, 0);

   // Set libwebsockets log level, default is too noisy
   lws_set_log_level(LLL_ERR, NULL);
}
