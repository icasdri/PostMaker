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
   * This function needs to store title and p (the content, whether blurb or full text),
   * and anything from conf that might be needed (e.g. website url, CC field)
   * somewhere of its choosing in dat that'll be used by the go() function.
   * This allows the function to process the contet as it sees fit.
   * The primaryUrl token %%% will already have been replaced.
   */
  prep: function(primaryUrl, conf, dat, title, contentP) {
    console.log("Got to Workers.gmail.prep()");
    dat.jsoConfig = {
      providerID: "google",
      client_id: "853943586263-f2ondnhfv7nbnk6m0ia64qr807of7i0k.apps.googleusercontent.com",
      redirect_uri: "https://postmaker.surge.sh",
      authorization: "https://accounts.google.com/o/oauth2/auth",
      scopes: { request: ["https://www.googleapis.com/auth/gmail.send"] }
    }
    dat.content = contentP;
    dat.subject = title;
    dat.to = conf.toField.trim();
    dat.cc= conf.ccField.trim();
    dat.bcc= conf.bccField.trim();
  },

  go: function(primaryUrl, dat, jso, progress) {
    if (typeof(primaryUrl) == "function") {
      // We are primary
      console.warn("[Workers.gmail] We will be unable to provide a primaryUrl even though we are primary!!!");
    } else {
      // We are secondary
    }
    console.log("Got to Workers.gmail.go()");
    console.log(jso);
    console.log(jso.ajax);
    progress(0);
    progress("Constructing message...");
    message = "To: " + dat.to + "\n";
    if (dat.cc) {
      message += "Cc: " + dat.cc + "\n";
    }
    if (dat.bcc) {
      message += "Bcc: " + dat.bcc + "\n";
    }
    if (dat.subject) {
      message += "Subject: " + dat.subject + "\n";
    }
    message += "\n" + dat.content;
    progress(12);
    progress("Encoding message...");
    var encoded = btoa(message);
    progress(24);
    progress("Sending message...");
    var scopes = [
      "https://mail.google.com/",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.send"
    ];
    jso.ajax({
      url: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
      oauth: {
        scopes: {
          request: scopes,
          require: scopes
        }
      },
      type: "POST",
      data: JSON.stringify({ raw: encoded }),
      contentType: "application/json",
      dataType: "json",
      success: function() {
        progress(100);
        progress("Sent!");
        progress({ color: App.COLORS.SUCCESS });
      },
      error: function(x) {
        progress(100);
        progress("Sending failed.");
        progress({ color: App.COLORS.ERROR });
        console.error("[Workers.gmail] Gmail responded with error: " + x);
      }
    });
  }
};
