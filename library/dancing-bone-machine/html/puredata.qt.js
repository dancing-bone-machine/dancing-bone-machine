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

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

define(function() {
   /**
    * This class allows javascript code running within a QWebview (Part of 
    * the QT framework) to communicate with a running instance of libpd 
    * using QT's QWebView bridge mechanism. 
    *
    * The API is 100% compatible with other bridge implementations in the 
    * dancing-bone-machine toolkit so that application code can be used 
    * within other runtime environments and platforms.
    *
    * @class PD
    * @static
    */
   var PD = {
      /**
       * Called by methods that have not been implemented yet
       *
       * @method _unimplemented
       * @private
       */
      _unimplemented: function(success){
         var caller = arguments.callee.caller.name;
         console.log("The function "+ caller + " has not been implemented yet. Help us out and report your need, or implement it yoursef :)");
         if(typeof success == 'function') success();
      },

      //////////////////////////////////////////////////////////////////////////
      // Callback mechanism so that C++ can call the correct callbacks in JS.

      /**
       * Holds the javascript callbacks for later calling when C++ returns
       *
       * @private
       */
      _callbacks: [],

      _queueCallbacks: function(success, error){
         var l = PD._callbacks.length;
         PD._callbacks[l] = success;
         PD._callbacks[l+1] = error;
         return l;
      },

      _fireCallback: function(callbackId, params){
         if(typeof(PD._callbacks[callbackId])=='function'){
            PD._callbacks[callbackId].call(this, params);
         }

         // success callbacks are even, error callbacks are odd, remove both
         PD._callbacks.splice(callbackId);
         if(callbackId%2 == 0){
            PD._callbacks.splice(callbackId+1);
         }
         else{
            PD._callbacks.splice(callbackId-1);
         }
      },
      
      //////////////////////////////////////////////////////////////////////////
      // shortcut functions
      //

      /**
       * Shortcut function, inits pd, loads a patch and starts sound 
       *
       * @method start
       */
      start: function(params, success, error){
         var p = params || {};
         var inChannels = p.inChannels || 0;
         var outChannels = p.outChannels || 2;
         var inDevice = p.inDevice || 'default';
         var outDevice = p.outDevice || 'default';
         var sampleRate = p.sampleRate || 44100;
         var mixingEnabled = p.mixingEnabled || false;
         var path = p.path || 'pd';
         var patch = p.patch || 'patch.pd';

         PD.startAudio(inDevice, inChannels, outDevice, outChannels, sampleRate, mixingEnabled, function(params){
            PD.init(params.inputChannels, params.outputChannels, params.sampleRate, function(){
               PD.openPatch(path, patch, function(){
                  PD.setActive(true);
                  success();
               },function(err){
                  error(err);
               });
            }, function(err){
               error(err);
            });
         },function(err){
            error(err);
         });

      },

      /**
       * Shortcut function, stops pd, closes patch, stops audio interface.      
       * 
       * @method stop
       */
      stop: function(success, error){
         PD.setActive(false);
         PD.stopAudio(function(){
            PD.closePatch(function(){
               PD.clear(function(){
                  success();
               }, function(err){
                  error(err);
               });
            });
         });
      },

      //////////////////////////////////////////////////////////////////////////
      // Open and close puredata files

      /**
       * Initializes PD engine
       *
       * @method init
       */
      init: function(inChannels, outChannels, sampleRate, success, error){
         var cbid = PD._queueCallbacks(success, error);
         QT.init(inChannels, outChannels, sampleRate, cbid);
      },

      /**
       * Closes PD engine
       *
       * @method clear
       */
      clear: function(success, error){
         var cbid = PD._queueCallbacks(success, error);
         QT.clear(cbid);
      },

      /**
       * Opens a PD patch. 
       *
       * @method openPatch
       */
      openPatch: function(dir, file, success, error){
         var cbid = PD._queueCallbacks(success, error);
         QT.openPatch(dir, file, cbid);
      },

      /**
       * Closes a PD patch.
       *
       * @method closePatch
       */
      closePatch: function(success, error){
         var cbid = PD._queueCallbacks(success,error);
         QT.closePatch(cbid);
      },

      /**
       * Returns the instance number ($0) for a patch.
       *
       * @method dollarZeroForFile
       */
      dollarZeroForFile: function(file, success, error){
         this._unimplemented(success);
      },

      /////////////////////////////////////////////////////////////////////////
      // Configure Audio device
      //

      /**
       * Gets a list of usable sound devices
       * 
       * Example:
       *    PD.getAudioDevices(function(devices){
       *       console.log(devices); 
       *    });
       *    
       * Would output something like
       * { 
       *    'devices': [
       *       {
       *          id: 1,
       *          api: 'ASIO',
       *          name: 'Roland FA-66',
       *          outputChannels: 6,
       *          inputChannels: 6,
       *          //etc... 
       *       },
       *       {
       *          id: 2,
       *          api: 'ASIO',
       *          name: 'M-Audio Whatever',
       *          outputChannels: 8,
       *          inputChannels: 8,
       *          //etc... 
       *       },
       *       {
       *          id: 1,
       *          api: 'DS',
       *          name: 'Intel Foo',
       *          outputChannels: 2,
       *          inputChannels: 0,
       *          //etc... 
       *       }
       *    ]
       * }
       */
      getAudioDevices: function(success, error){
         var cbid = PD._queueCallbacks(success, error);
         QT.getAudioDevices(cbid);
      },

      getDefaultOutputDevice: function(success, error){
         var cbid = PD._queueCallbacks(success, error);
         QT.getDefaultOutputDevice(cbid);
      },

      /**
       * Configures connection with audio hardware with given sample rate, 
       * number of channels and enables or disables mixing (wether sound 
       * stays on on when app ins minimized).
       * Parameters may be changed by audio engine so success callback 
       * should check for new values.
       * 
       * Example:
       *     
       *      PD.configurePlayback('ASIO:1', 2, 'ASIO:2', 2, 44100, false,  
       *         function(params){
       *           console.log(params);
       *         },
       *         function(error){
       *           console.log(error);
       *         }
       *       );
       *  
       * @method configurePlayback
       */
      startAudio: function(inputDevice, inputChannels, outputDevice, outputChannels, sampleRate, mixingEnabled, success, error){
         var cbid = PD._queueCallbacks(success, error);
         QT.startAudio(inputDevice, inputChannels, outputDevice, outputChannels, sampleRate, mixingEnabled, cbid);
      },

      stopAudio: function(success, error){
         var cbid = PD._queueCallbacks(success, error);
         QT.stopAudio(cbid);
      },

      //////////////////////////////////////////////////////////////////////////
      // Send messages to PD 

      /**
       * DSP on/off to PD.
       *
       * @method setActive
       */
      setActive: function(active){
         QT.setActive(active);
      },

      /**
       * Send a bang message to the PD patch
       *
       * @method sendBang
       */
      sendBang: function(receiver){
         QT.sendBang(receiver);
      },

      /**
       * Send a message to the PD patch
       *
       * @method sendFloat
       */
      sendFloat: function(num, receiver){
         QT.sendFloat(num, receiver);
      },

     /**
      * Send a symbol message to the PD patch
      *
      * @mehod sendSymbol
      */
     sendSymbol: function(value, receiver){
       // cordova.exec(null, null, "PureData", "sendSymbol", [value, receiver]);
     },

      /**
       * Send a list message to the PD patch
       *
       * @mehod sendList
       */
      sendList: function(list, receiver){
         QT.sendList(list, receiver);
      },

      /**
       * Send a typed message to the PD patch.
       * Ex: To send [pd; dsp 1(
       *     You'd do  PD.sendMessage([1], 'pd', 'dsp'); 
       *
       * @mehod sendMessage
       */
      sendMessage: function(list, receiver, symbol){
         this._unimplemented();
         // var msg = list.join(' ');
         // msg = ['ds-send-message', receiver+';', symbol, msg].join(' ');
         // this._websocket.send(msg);
      },


      //////////////////////////////////////////////////////////////////////////
      // Receiving messages from PD
      //

     /**
      * Subscribe to sends from pd patch.
      * Ex: PD.bind('gain', function(msg){
      *         console.log(msg);
      *     })
      *
      * @mehod bind
      */
     bind: function(sender, callback){
       PD._bindCallbacks[sender] = callback;
       QT.bind(sender);
     },

     _bindCallbacks: {},

     _didReceiveSend: function(sender, msg){
       var callback = PD._bindCallbacks[sender];
       if(typeof(callback)=='function'){
         callback.call(this, msg);
       }
     },

      /**
       * Unsubscribe from sends from pd patch.
       *
       * @mehod unbind
       */
      unbind: function(sender){
         this._unimplemented();
      },

      /**
       * Unsubscribe from all sends from pd patch.
       *
       * @mehod unbindAll
       */
      unbindAll: function(){
         this._unimplemented();
      },

      //////////////////////////////////////////////////////////////////////////
      // Accessing PD arrays
      //

      /**
       * Returns the size of a named array.
       *
       * @mehod arraySize
       */
      arraySize: function(arrayName, success, error){
         this._unimplemented();
      },

      /**
       * Writes to a PD array
       *
       * @mehod arraySize
       */
      writeArray: function(arrayName, data, success, error){
         this._unimplemented();
      },

      /**
       * Reads contents of an array or table object in the PD patch.
       *
       * @mehod readArray
       */
      readArray: function(arrayName, n, offset, success, error){
         this._unimplemented();
      },

      //////////////////////////////////////////////////////////////////////////
      // Send MIDI events to PD

      /**
       * Send a MIDI note on message to the PD patch
       *
       * @method sendNoteOn
       */
      sendNoteOn: function(channel, pitch, velocity){
         QT.sendNoteOn(channel, pitch, velocity);
      },

      sendControlChange: function(channel, controller, value){ 
         this._unimplemented();
      },

      sendProgramChange: function(channel, program){ 
         this._unimplemented();
      },

      sendPitchBend: function(channel, value){ 
         this._unimplemented();
      },

      sendAfterTouch: function(channel, value){ 
         this._unimplemented();
      },

      sendPolyAfterTouch: function(channel, pitch, value){ 
         this._unimplemented();
      },

      sendMidiByte: function(port, value){ 
         this._unimplemented();
      },

      sendSysEx: function(port, value){ 
         this._unimplemented();
      },

      sendSysRealTime: function(port, value){ 
         this._unimplemented();
      },

      ///////////////////////////////////////////////////////////////////////// 
      // Receive MIDI events from PD

      bindMidiNoteOn: function(callback){
         this._unimplemented();
      },

      bindMidiControlChange: function(callback){
         this._unimplemented();
      },

      bindMidiProgramChange: function(callback){
         this._unimplemented();
      },

      bindMidiPitchBend: function(callback){
         this._unimplemented();
      },

      bindMidiAfterTouch: function(callback){
         this._unimplemented();
      },

      bindMidiPolyAfterTouch: function(callback){
         this._unimplemented();
      },

      bindMidiByte: function(callback){
         this._unimplemented();
      },

      bindPrint: function(callback){
         this._unimplemented();
         // default implementation should console.log
      }
   };

   // Connect some QT signals to JS methods.
   QT.fireErrorCallback.connect(PD, "_fireCallback");
   QT.fireOKCallback.connect(PD, "_fireCallback");
   QT.doReceiveBang.connect(PD, "_didReceiveSend");
   QT.doReceiveFloat.connect(PD, "_didReceiveSend");
   QT.doReceiveSymbol.connect(PD, "_didReceiveSend");
   QT.doReceiveList.connect(PD, "_didReceiveSend");
   // QT.doReceiveMessage.connect(PD, "_didReceiveSend");

   return PD;
});
