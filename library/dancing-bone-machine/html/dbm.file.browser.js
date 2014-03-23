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
      showDialog: function(caption, filter, openOrSave, defaultFileName, success, error){
         // Do nothing.
         if(typeof(success)=='function'){
            success.call(this, {'path':defaultFileName});
         }
      },

      writeFile: function(path, data, success, error){
         var D = document,
         a = D.createElement("a");
         strMimeType = "application/octet-stream";

         if (navigator.msSaveBlob) { // IE10+
            return navigator.msSaveBlob(new Blob([data], {type: strMimeType}), path);
         }

         if ('download' in a) { //html5 A[download]
            a.href = "data:" + strMimeType + "," + encodeURIComponent(data);
            a.setAttribute("download", path);
            D.body.appendChild(a);
            setTimeout(function() {
               a.click();
               D.body.removeChild(a);
            }, 66);
            return true;
         }

         //do iframe dataURL download (old ch+FF):
         var f = D.createElement("iframe");
         D.body.appendChild(f);
         f.src = "data:" +  strMimeType   + "," + encodeURIComponent(data);

         setTimeout(function() {
            D.body.removeChild(f);
            D.body.removeChild(a);
         }, 333);

         if(typeof(success)=='function'){
            success.call(this);
         }
      },

      readFile: function(path, success, error){
         var f = $('<input type="file" id="load-file"/>');
         $('document').append(f);
         f.on('change', function(e){
            var file = e.target.files[0]; 
            var reader = new FileReader();
            reader.onload = function(theFile){
               var data = theFile.target.result;

               f.remove();

               if(typeof(success)=='function'){
                  success.call(this, {'data':data});
               }
            }.bind(this);
            reader.readAsText(file);
         }.bind(this));
         f.trigger('click');
      }
   };

   return DBMFile;
});
