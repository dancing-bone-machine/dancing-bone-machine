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

/**
 * This class allows javascript code running within a web browser to
 * communicate with a running instance of PureData or Pd-extended using
 * websockets. 
 *
 * The API is 100% compatible with the LibPD Apache Cordova
 * plugin included in the dancing-bone-machine distribution so that 
 * application code can be used within a Cordova wrapped app or in a 
 * desktop web browser.
 *
 */
define(function() {
   /**
    * Manages communication with a running PureData instance.
    *
    * @class PD
    * @static
    */
   var PD = {
      // /**
      //  * Holds an instance of a websocket object
      //  *
      //  * @private
      //  */
      // _websocket: undefined,

      // /**
      //  * Called by methods that do nothing in debug mode
      //  *
      //  * @method _doNothing
      //  * @private
      //  */
      // _doNothing: function(success){
      //    if(typeof success != 'undefined') success();
      // },

      /**
       * Called by methods that have not been implemented yet
       *
       * @method _unimplemented
       * @private
       */
      _unimplemented: function(success){
         var caller = arguments.callee.caller.name;
         console.error("The function "+ caller + " has not been implemented yet. Help us out and report your need, or implement it yoursef :)");
         if(typeof success != 'undefined') success();
      },


      // initialize: function(success, error){
      //    this._doNothing(success);
      // },

      // clearSearchPath: function(success, error){
      //    this._doNothing(success);
      // },

      // addToSearchPath: function(path, success, error){
      //    this._doNothing(success);
      // },

      /**
       * Opens a PD patch. 
       */
      openFile: function(dir, file, success, error){
         cordova.exec(success, error, "PureData", "openFile", [dir, file]);
      },

      // _file: null,

      // _openFileSuccessCallback: null,
      // 
      // _connectionTimer: null,

      // _connect: function(){
      //    window.WebSocket = window.WebSocket || window.MozWebSocket;
      //    this._websocket = new WebSocket('ws://127.0.0.1:9000', 'pd-websocket'); 

      //    this._websocket.onopen = function () {
      //       console.log('Established connection with ' + PD._file);
      //       if(typeof PD._openFileSuccessCallback != 'undefined') PD._openFileSuccessCallback();
      //    };

      //    this._websocket.onerror = function () {
      //       setTimeout(PD._connect, 5000);
      //       console.log('Could not establish connection with ' + PD._file + '. Make sure it\'s open in pd-extended. Retrying in 5 secs...');
      //    };

      //    this._websocket.onmessage = this._didReceiveMessage;
      // },

      // /**
      //  * Fires when a websockets message was received.
      //  *
      //  * @private
      //  */
      // _didReceiveMessage: function(message) {
      //    message=message.data;
      //    var i = message.indexOf(' ');
      //    var cmd = message.substring(0, i);
      //    switch (cmd) {
      //       case 'ds-send':
      //          PD._didReceiveSend(message.substr(i+1));
      //          break;
      //       case 'ds-read-array':
      //          PD._didReadArray(message.substr(i+1));
      //          break;
      //       case 'ds-bendout':
      //       case 'ds-ctlout':
      //       case 'ds-midiout':
      //       case 'ds-noteout':
      //       case 'ds-pgmout':
      //       case 'ds-polytouchout':
      //       case 'ds-touchout':
      //          PD._didReceiveMidi(cmd, message.substr(i+1));
      //          break;

      //       default:
      //          // code
      //    }
      // },

      // closeFile: function(file, success, error){
      //    this._doNothing(success);
      // },

      // dollarZeroForFile: function(file, success, error){
      //    this._unimplemented(); 
      // },

      // /**
      //  * Send a bang message to the PD patch
      //  *
      //  * @mehod sendBang
      //  */
      // sendBang: function(receiver){
      //    var msg = 'ds-send-bang ' +  receiver;
      //    this._websocket.send(msg);
      // },

      /**
       * Send a message to the PD patch
       */
      sendFloat: function(num, receiver){
         cordova.exec(null, null, "PureData", "sendFloat", [num, receiver]);
      },

      // /**
      //  * Send a symbol message to the PD patch
      //  *
      //  * @mehod sendFloat
      //  */
      // sendSymbol: function(value, receiver){
      //    var msg = 'ds-send-symbol ' +  receiver +' '+ value;
      //    this._websocket.send(msg);
      // },

      // /**
      //  * Send a list message to the PD patch
      //  *
      //  * @mehod sendList
      //  */
      // sendList: function(list, receiver){
      //    var msg = list.join(' ');
      //    msg = ['ds-send-list', receiver, msg].join(' ');
      //    this._websocket.send(msg);
      // },

      // /**
      //  * Send a typed message to the PD patch.
      //  * Ex: To send [pd; dsp 1(
      //  *     You'd do  PD.sendMessage([1], 'pd', 'dsp'); 
      //  *
      //  * @mehod sendMessage
      //  */
      // sendMessage: function(list, receiver, symbol){
      //    this._unimplemented();
      //    // var msg = list.join(' ');
      //    // msg = ['ds-send-message', receiver+';', symbol, msg].join(' ');
      //    // this._websocket.send(msg);
      // },


      // /**
      //  * Subscribe to sends from pd patch.
      //  * Ex: PD.bind('gain', function(msg){
      //  *         console.log(msg);
      //  *     })
      //  *
      //  * @mehod bind
      //  */
      // bind: function(sender, callback){
      //    this._bindCallbacks[sender] = callback;
      //    var msg = 'ds-bind ' +  sender;
      //    this._websocket.send(msg);
      // },

      // _bindCallbacks: {}, 

      // _didReceiveSend: function(msg){
      //    var i = msg.indexOf(' ');
      //    var sendName;
      //    if(i == -1){
      //       sendName = msg;
      //       msg = 'bang';
      //    }
      //    else{
      //       sendName = msg.substring(0,i);
      //       msg = msg.substr(i+1);
      //    }
      //    var callback = PD._bindCallbacks[sendName];
      //    if(typeof callback == 'function') callback(msg);
      // },

      // /**
      //  * Unsubscribe from sends from pd patch.
      //  *
      //  * @mehod unbind
      //  */
      // unbind: function(sender){
      //    this._bindCallbacks[sender] = null;
      // },

      // /**
      //  * Unsubscribe from all sends from pd patch.
      //  *
      //  * @mehod unbindAll
      //  */
      // unbindAll: function(){
      //    var msg = 'ds-unbind-all bang';
      //    this._websocket.send(msg);
      // },

      // arraySize: function(arrayName, success, error){
      //    this._unimplemented();
      // },

      /**
       * Reads contents of an array or table object in the PD patch.
       *
       * @mehod readArray
       */
      readArray: function(arrayName, n, offset, success, error){
         cordova.exec(success, error, "PureData", "readArray", [arrayName, n, offset]);
      },

      // _readArrayCallbacks: [],

      // _didReadArray: function(data){
      //    cbk = PD._readArrayCallbacks[0];
      //    if(typeof cbk == 'function'){
      //       // Split data into an array and get rid of first element (array name)
      //       var points = data.split(' ');
      //       points.shift();
      //       cbk(points);
      //    }
      // },

      // writeArray: function(arrayName, data, success, error){
      //    this._unimplemented();
      // },

      /**
       * Send a MIDI note on message to the PD patch
       *
       * @method sendNoteOn
       */
      sendNoteOn: function(channel, pitch, velocity, success, error){
         cordova.exec(success, error, "PureData", "sendNoteOn", [channel, pitch, velocity]);
      },

      // sendControlChange: function(channel, controller, value){ 
      //    this._websocket.send('ds-ctlin ' + channel +' '+ controller +' '+ value);
      // },

      // sendProgramChange: function(channel, program){ 
      //    this._websocket.send('ds-pgmin ' + channel +' '+ program);
      // },

      // sendPitchBend: function(channel, value){ 
      //    this._websocket.send('ds-bendin ' + channel +' '+ value);
      // },

      // sendAfterTouch: function(channel, value){ 
      //    this._websocket.send('ds-touchin ' + channel +' '+ value);
      // },

      // sendPolyAfterTouch: function(channel, pitch, value){ 
      //    this._websocket.send('ds-polytouchin ' + channel +' '+ pitch +' '+ value);
      // },

      // sendMidiByte: function(port, value){ 
      //    this._websocket.send('ds-midiin ' + port +' '+ value);
      // },

      // sendSysEx: function(port, value){ 
      //    this._websocket.send('ds-sysexin ' + port +' '+ value);
      // },

      // sendSysRealTime: function(port, value){ 
      //    this._websocket.send('ds-midirealtimein ' + port +' '+ value);
      // },

      // _didReceiveMidi: function(cmd, msg){
      //    switch (cmd) {
      //       case 'ds-bendout':
      //          if(typeof PD._bindMidiPitchBendCallback == 'function'){
      //             PD._bindMidiPitchBendCallback(msg);
      //          }
      //          break;
      //       case 'ds-ctlout':
      //          if(typeof PD._bindMidiControlChangeCallback == 'function'){
      //             PD._bindMidiControlChangeCallback(msg);
      //          }
      //          break;
      //       case 'ds-midiout':
      //          if(typeof PD._bindMidiByteCallback== 'function'){
      //             PD._bindMidiByteCallback(msg);
      //          }
      //          break;
      //       case 'ds-noteout':
      //          if(typeof PD._bindMidiNoteOnCallbackt == 'function'){
      //             PD._bindMidiNoteOnCallback(msg);
      //          }
      //          break;
      //       case 'ds-pgmout':
      //          if(typeof PD._bindMidiProgramChangeCallback== 'function'){
      //             PD._bindMidiProgramChangeCallback(msg);
      //          }
      //          break;
      //       case 'ds-polytouchout':
      //          if(typeof PD._bindMidiPolyAfterTouchCallback== 'function'){
      //             PD._bindMidiPolyAfterTouchCallback(msg);
      //          }
      //          break;
      //       case 'ds-touchout':
      //          if(typeof PD._bindMidiAfterTouchCallback== 'function'){
      //             PD._bindMidiAfterTouchCallback(msg);
      //          }
      //       break;

      //       default:
      //          break;
      //    }
      // },

      // bindMidiNoteOn: function(callback){
      //    this._bindMidiNoteOnCallback=callback;
      // },
      // _bindMidiNoteOnCallback: null,

      // bindMidiControlChange: function(callback){
      //    this._bindMidiControlChangeCallback=callback;
      // },
      // _bindMidiControlChangeCallback: null,

      // bindMidiProgramChange: function(callback){
      //    this._bindMidiProgramChangeCallback=callback;
      // },
      // _bindMidiProgramChangeCallback: null,

      // bindMidiPitchBend: function(callback){
      //    this._bindMidiPitchBendCallback=callback;
      // },
      // _bindMidiPitchBendCallback: null,

      // bindMidiAfterTouch: function(callback){
      //    this._bindMidiAfterTouchCallback=callback;
      // },
      // _bindMidiAfterTouchCallback: null,

      // bindMidiPolyAfterTouch: function(callback){
      //    this._bindMidiPolyAfterTouchCallback=callback;
      // },
      // _bindMidiPolyAfterTouchCallback: null,

      // bindMidiByte: function(callback){
      //    this._bindMidiByteCallback=callback;
      // },
      // _bindMidiByteCallback: null,

      // bindPrint: function(callback){
      //    this._unimplemented();
      //    // default implementation should console.log
      // },

      /**
       * Configures connection with audio hardware with given sample rate, 
       * number of channels and enables or disables mixing (wether sound 
       * stays on on when app ins minimized).
       * Parameters may be changed by audio engine so success callback 
       * should check for new values.
       * 
       * Example:
       *     
       *      PureData.configurePlayback(44100, 2, false, false, 
       *         function(params){
       *           // Success, do something with params.sampleRate, 
       *           // params.numChannels, params.inputEnabled, params.mixingEnabled
       *         },
       *         function(error){
       *           console.log(error);
       *           navigator.notification.alert('Sorry, I can\'t start audio playback :(', null, null, null);
       *         }
       *       );
       *  
       * @method configurePlayback
       */
      configurePlayback: function(sampleRate, numberChannels, inputEnabled, mixingEnabled, success, error){
         cordova.exec(success, error, "PureData", "configurePlayback", [sampleRate, numberChannels, inputEnabled, mixingEnabled]);
      },

      // /**
      //  * Does nothing in debug mode.
      //  *
      //  * @method configureAmbient
      //  */
      // configureAmbient: function(sampleRate, numberChannels, mixingEnabled, success, error){
      //    this._doNothing(success);
      // },

      // /**
      //  * Does nothing in debug mode.
      //  *
      //  * @method configureTicksPerBuffer
      //  */
      // configureTicksPerBuffer: function(ticksPerBuffer, success, error){
      //    this._doNothing(success);
      // },

      /**
       * Start/Stop sound I/O.
       */
      setActive: function(active, success, error){
         cordova.exec(success, error, "PureData", "setActive", [active]);
      },

      // /**
      //  * Does nothing in debug mode
      //  *
      //  * @method setActive
      //  */
      // getActive: function(success, error){
      //    this._doNothing(success);
      // },
   };
   return PD;
});
