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
 * When running your apps in a web browser, some API calls can cause 
 * errors, or you might want to fake their return values. Here are
 * some shims to fake API calls.
 */


// fake navigator.notification.alert() with a browser alert()
if(typeof navigator === 'undefined'){
  navigator={};
}

if(typeof navigator.notification === 'undefined'){
  navigator.notification={};
}

navigator.notification.alert = function(message, callback, title, buttonName){
  alert(message);
  callback(); 
};
