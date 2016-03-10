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

Workers.gmail = {
  /*
   * This function needs to store title and p (the content, whether blurb or full text)
   * somewhere of its choosing in dat that'll be used by the go() function.
   * This allows the function to process the contet as it sees fit.
   * The primaryUrl token %%% will already have been replaced.
   */
  prep: function(primaryUrl, dat, title, contentP) {
    dat.jsoConfig = {
      providerID: "google",
      client_id: "853943586263-f2ondnhfv7nbnk6m0ia64qr807of7i0k.apps.googleusercontent.com",
      redirect_uri: "https://postmaker.surge.sh",
      authorization: "https://accounts.google.com/o/oauth2/auth",
      scopes: { request: ["https://www.googleapis.com/auth/gmail.send"] }
    }
    dat.content = contentP;
    dat.title = title;
  },

  go: function(primaryUrl, dat, jso, progress) {
    if (typeof(primaryUrl) == "function") {
      // We are primary
    } else {
      // We are secondary
    }
  }
};
