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
 * plugin included in the Dancing Bone Machine distribution so that 
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
      /**
       * Holds an instance of a websocket object
       *
       * @private
       */
      _websocket: undefined,

      /**
       * Called by methods that do nothing in debug mode
       *
       * @method _doNothing
       * @private
       */
      _doNothing: function(success){
         if(typeof success != 'undefined') success();
      },

      /**
       * Called by methods that have not been implemented yet
       *
       * @method _unimplemented
       * @private
       */
      _unimplemented: function(success){
         var caller = arguments.callee.caller.name;
         console.error("The function "+ caller + " has not been implemented yet. Help us out and report your need, or implement it yoursef! :)");
         if(typeof success != 'undefined') success();
      },

      /**
       * Wrapper for websocket.send
       *
       * @method _send
       * @private
       */
      _send: function(msg){
         if(typeof this._websocket == 'undefined'){
            console.log("Trying to send message with websocket, but there's no connection.");
            console.log("Message: " + msg);
            return;
         }
         this._websocket.send(msg);
      },

      /**
       * Fires when a websockets message was received.
       *
       * @private
       */
      _didReceiveMessage: function(message) {
         message=message.data;
         var i = message.indexOf(' ');
         var cmd = message.substring(0, i);
         switch (cmd) {
            case 'dbm-send':
               PD._didReceiveSend(message.substr(i+1));
               break;
            case 'dbm-bendout':
            case 'dbm-ctlout':
            case 'dbm-midiout':
            case 'dbm-noteout':
            case 'dbm-pgmout':
            case 'dbm-polytouchout':
            case 'dbm-touchout':
               PD._didReceiveMidi(cmd, message.substr(i+1));
               break;
            case 'dbm-read-array':
               PD._didReadArray(message.substr(i+1));
               break;
            default:
               break;
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

         PD.init(inChannels, outChannels, sampleRate, function(){
            PD.openPatch(path, patch, function(){
               PD.startAudio(inDevice, inChannels, outDevice, outChannels, sampleRate, mixingEnabled, function(){
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

      init: function(inChannels, outChannels, sampleRate, success, error){
         this._doNothing(success);
      },

      clear: function(success, error){
         this._doNothing(success);
      },

      /**
       * Connects to websockets proxy script, displays console messages to 
       * remind user to launch pd-extended.
       *
       * @method openPatch
       */
      openPatch: function(dir, file, success, error){
         this._openFileSuccessCallback = success;
         this._file = file;
         this._connect();
      },

      _file: null,

      _openFileSuccessCallback: null,
      
      _connectionTimer: null,

      _connect: function(){
         window.WebSocket = window.WebSocket || window.MozWebSocket;
         this._websocket = new WebSocket('ws://127.0.0.1:9000', 'pd-websocket'); 

         this._websocket.onopen = function () {
            console.log('Established connection with ' + PD._file);
            if(typeof PD._openFileSuccessCallback != 'undefined') PD._openFileSuccessCallback();
         };

         this._websocket.onerror = function () {
            setTimeout(PD._connect, 5000);
            console.log('Could not establish connection with ' + PD._file + '. Make sure it\'s open in pd-extended. Retrying in 5 secs...');
         };

         this._websocket.onmessage = this._didReceiveMessage;
      },

      closePatch: function(file, success, error){
         this._doNothing(success);
      },

      dollarZeroForFile: function(file, success, error){
         this._unimplemented(); 
      },

      clearSearchPath: function(success, error){
         this._doNothing(success);
      },

      addToSearchPath: function(path, success, error){
         this._doNothing(success);
      },

      /////////////////////////////////////////////////////////////////////////
      // Configure Audio device
      //

      getAudioDevices: function(success, error){
         var device = {
            id: 1,
            api: 'WEBSOCKETS',
            name: 'PD',
            outputChannels: 100,
            inputChannels: 100
         };

         success( {devices:[device]} );
      },

      getDefaultOutputDevice: function(success, error){
         PD.getAudioDevices(function(devices){
            var dev = devices.devices[0];
            success(dev);
         })
      },

      startAudio: function(inputDevice, inputChannels, outputDevive, outputChannels, sampleRate, mixingEnabled, success, error){
         this._doNothing(success);
      },

      stopAudio: function(success, error){
         this._doNothing(success);
      },


      //////////////////////////////////////////////////////////////////////////
      // Send messages to PD 

      /**
       * Sends DSP on/off message
       *
       * @method setActive
       */
      setActive: function(active){
         var msg = 'dbm-active ' + active;
         this._send(msg);
      },

      /**
       * Does nothing in debug mode
       *
       * @method setActive
       */
      getActive: function(success, error){
         this._doNothing(success);
      },

      /**
       * Send a bang message to the PD patch
       *
       * @mehod sendBang
       */
      sendBang: function(receiver){
         var msg = 'dbm-send-bang ' +  receiver;
         this._send(msg);
      },

      /**
       * Send a float message to the PD patch
       *
       * @mehod sendFloat
       */
      sendFloat: function(value, receiver){
         var msg = 'dbm-send-float ' +  receiver +' '+ value;
         this._send(msg);
      },

      /**
       * Send a symbol message to the PD patch
       *
       * @mehod sendSymbol
       */
      sendSymbol: function(value, receiver){
         var msg = 'dbm-send-symbol ' +  receiver +' '+ value;
         this._send(msg);
      },

      /**
       * Send a list message to the PD patch
       *
       * @mehod sendList
       */
      sendList: function(list, receiver){
         var msg = list.join(' ');
         msg = ['dbm-send-list', receiver, msg].join(' ');
         this._send(msg);
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
         // msg = ['dbm-send-message', receiver+';', symbol, msg].join(' ');
         // this._send(msg);
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
         this._bindCallbacks[sender] = callback;
         var msg = 'dbm-bind ' +  sender;
         this._send(msg);
      },

      _bindCallbacks: {}, 

      _didReceiveSend: function(msg){
         var i = msg.indexOf(' ');
         var sendName;
         if(i == -1){
            sendName = msg;
            msg = 'bang';
         }
         else{
            sendName = msg.substring(0,i);
            msg = msg.substr(i+1);
         }
         var callback = PD._bindCallbacks[sendName];
         if(typeof callback == 'function') callback(msg);
      },

      /**
       * Unsubscribe from sends from pd patch.
       *
       * @mehod unbind
       */
      unbind: function(sender){
         this._bindCallbacks[sender] = null;
      },

      /**
       * Unsubscribe from all sends from pd patch.
       *
       * @mehod unbindAll
       */
      unbindAll: function(){
         var msg = 'dbm-unbind-all bang';
         this._send(msg);
      },

      arraySize: function(arrayName, success, error){
         this._unimplemented();
      },

      //////////////////////////////////////////////////////////////////////////
      // Receiving messages from PD
      //

      /**
       * Reads contents of an array or table object in the PD patch. 
       * If n is 0, the whole array is returned
       *
       * @mehod readArray
       */
      readArray: function(arrayName, n, offset, success, error){
         this._readArrayCallbacks = [success, error, n, offset];
         this._send('dbm-read-array ' + arrayName);
      },

      _readArrayData: [],

      _readArrayCallbacks: [],

      _didReadArray: function(data){
         var data = data.split(' ');
         if(data[1]=='start'){
            _readArrayData = [];
            data.shift();
         }
         data.shift();
         _readArrayData = _readArrayData.concat(data);
         if(data[data.length-1] == 'end'){
            _readArrayData.pop();
            cbk = PD._readArrayCallbacks[0];
            if(typeof cbk == 'function'){
               var offset = PD._readArrayCallbacks[3];
               var n = PD._readArrayCallbacks[2];
               if(n!=0){
                  _readArrayData = _readArrayData.slice(offset, offset+n);
               }
               _readArrayData = _readArrayData.map(Number);
               cbk(_readArrayData);
            }
         }
      },

      writeArray: function(arrayName, data, success, error){
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
         this._send('dbm-notein ' + channel +' '+ pitch +' '+ velocity);
      },

      sendControlChange: function(channel, controller, value){ 
         this._send('dbm-ctlin ' + channel +' '+ controller +' '+ value);
      },

      sendProgramChange: function(channel, program){ 
         this._send('dbm-pgmin ' + channel +' '+ program);
      },

      sendPitchBend: function(channel, value){ 
         this._send('dbm-bendin ' + channel +' '+ value);
      },

      sendAfterTouch: function(channel, value){ 
         this._send('dbm-touchin ' + channel +' '+ value);
      },

      sendPolyAfterTouch: function(channel, pitch, value){ 
         this._send('dbm-polytouchin ' + channel +' '+ pitch +' '+ value);
      },

      sendMidiByte: function(port, value){ 
         this._send('dbm-midiin ' + port +' '+ value);
      },

      sendSysEx: function(port, value){ 
         this._send('dbm-sysexin ' + port +' '+ value);
      },

      sendSysRealTime: function(port, value){ 
         this._send('dbm-midirealtimein ' + port +' '+ value);
      },

      ///////////////////////////////////////////////////////////////////////// 
      // Receive MIDI events from PD

      _didReceiveMidi: function(cmd, msg){
         switch (cmd) {
            case 'dbm-bendout':
               if(typeof PD._bindMidiPitchBendCallback == 'function'){
                  PD._bindMidiPitchBendCallback(msg);
               }
               break;
            case 'dbm-ctlout':
               if(typeof PD._bindMidiControlChangeCallback == 'function'){
                  PD._bindMidiControlChangeCallback(msg);
               }
               break;
            case 'dbm-midiout':
               if(typeof PD._bindMidiByteCallback== 'function'){
                  PD._bindMidiByteCallback(msg);
               }
               break;
            case 'dbm-noteout':
               if(typeof PD._bindMidiNoteOnCallbackt == 'function'){
                  PD._bindMidiNoteOnCallback(msg);
               }
               break;
            case 'dbm-pgmout':
               if(typeof PD._bindMidiProgramChangeCallback== 'function'){
                  PD._bindMidiProgramChangeCallback(msg);
               }
               break;
            case 'dbm-polytouchout':
               if(typeof PD._bindMidiPolyAfterTouchCallback== 'function'){
                  PD._bindMidiPolyAfterTouchCallback(msg);
               }
               break;
            case 'dbm-touchout':
               if(typeof PD._bindMidiAfterTouchCallback== 'function'){
                  PD._bindMidiAfterTouchCallback(msg);
               }
            break;

            default:
               break;
         }
      },

      bindMidiNoteOn: function(callback){
         this._bindMidiNoteOnCallback=callback;
      },
      _bindMidiNoteOnCallback: null,

      bindMidiControlChange: function(callback){
         this._bindMidiControlChangeCallback=callback;
      },
      _bindMidiControlChangeCallback: null,

      bindMidiProgramChange: function(callback){
         this._bindMidiProgramChangeCallback=callback;
      },
      _bindMidiProgramChangeCallback: null,

      bindMidiPitchBend: function(callback){
         this._bindMidiPitchBendCallback=callback;
      },
      _bindMidiPitchBendCallback: null,

      bindMidiAfterTouch: function(callback){
         this._bindMidiAfterTouchCallback=callback;
      },
      _bindMidiAfterTouchCallback: null,

      bindMidiPolyAfterTouch: function(callback){
         this._bindMidiPolyAfterTouchCallback=callback;
      },
      _bindMidiPolyAfterTouchCallback: null,

      bindMidiByte: function(callback){
         this._bindMidiByteCallback=callback;
      },
      _bindMidiByteCallback: null,

      bindPrint: function(callback){
         this._unimplemented();
         // default implementation should console.log
      }



      /**
       * Simulate what a media picker would return
       */
      // showMediaPicker: function(success, error){
      //    setTimeout(function(){
      //       success({
      //          title: 'I am the Walrus',
      //          album: 'Magical Mystery Tour',
      //          artist: 'The Beatles',
      //          path: '/Users/rafa/Desktop/IAmTheWalrus-MagicalMysteryTour-TheBeatles.caf',
      //          builtIn: false
      //       });
      //    },2000);
      // },
   };
   return PD;
})
