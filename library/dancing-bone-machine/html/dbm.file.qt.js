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
    * the QT framework) to read and write to a file system. The actual
    * interfacing with the filesystem is done by the C++ DBM::File class.
    *
    * The API is 100% compatible with other DBM.File implementations in the 
    * dancing-bone-machine toolkit so that application code can be used 
    * within other runtime environments and platforms.
    *
    * @class DBMFile
    * @static
    */
   var DBMFile = {
      //////////////////////////////////////////////////////////////////////////
      // Callback mechanism so that C++ can call the correct callbacks in JS.

      /**
       * Holds the javascript callbacks for later calling when C++ returns
       *
       * @private
       */
      _callbacks: [],

      _queueCallbacks: function(success, error){
         var l = DBMFile._callbacks.length;
         DBMFile._callbacks[l] = success;
         DBMFile._callbacks[l+1] = error;
         return l;
      },

      _fireCallback: function(callbackId, params){
         if(typeof(DBMFile._callbacks[callbackId])=='function'){
            DBMFile._callbacks[callbackId].call(this, params);
         }
         // success callbacks are even, error callbacks are odd, remove both
         DBMFile._callbacks.splice(callbackId);
         if(callbackId%2 == 0){
            DBMFile._callbacks.splice(callbackId+1);
         }
         else{
            DBMFile._callbacks.splice(callbackId-1);
         }
      },

      //////////////////////////////////////////////////////////////////////////
      // Public (interesting) methods

      /**
       * Shows a file open/save dialog. 
       *
       * @method showDialog
       */
      showDialog: function(caption, filter, openOrSave, defaultFileName, success, error){
         var cbid = DBMFile._queueCallbacks(success, error);
         QTFile.showDialog(caption, filter, openOrSave, cbid);
      },

      writeFile: function(path, data, success, error){
         var cbid = DBMFile._queueCallbacks(success, error);
         QTFile.writeFile(path, data, cbid);
      },

      readFile: function(path, success, error){
         var cbid = DBMFile._queueCallbacks(success, error);
         QTFile.readFile(path, cbid);
      }
   };

   // Connect some QT signals to JS methods.
   QTFile.errorCallback.connect(DBMFile, "_fireCallback");
   QTFile.okCallback.connect(DBMFile, "_fireCallback");

   return DBMFile;
});
