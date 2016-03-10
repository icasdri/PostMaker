/* Copyright 2016 icasdri

This file is part of PostMaker.

PostMaker is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

PostMaker is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with PostMaker.  If not, see <http://www.gnu.org/licenses/>.
*/

Workers.wordpress = {
  prep: function(primaryUrl, dat, title, contentP) {
    console.log("worker wordpress's prep() getting called");
    dat.title = title;
    dat.content = contentP;
  },

  go: function(primaryUrl, dat, jso, progress) {
    if (typeof(primaryUrl) == "function") {
      console.log("worker wordpress's go() getting called as primary");
      // We are primary
    } else {
      console.log("worker wordpress's go() getting called as secondary");
      // We are secondary
    }
  }
};
