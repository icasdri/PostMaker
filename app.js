/* Copyright 2015-2016 icasdri

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

var Workers = {};

var App = {
  COLORS: {
    PRIMARY: "#2196F3", // mui-color("blue")
    SUCCESS: "#4CAF50", // mui-color("green")
    WARNING: "#FFEB3B", // mui-color("yellow")
    ERROR: "#F44336" // mui-color("red")
  },
  PUBLISHER_TYPES: {
    "wordpress": {
      typeName: "WordPress",
      configTemplate: JSON.stringify({
        url: "",
        categories: ""
      })
    },
    "facebook-group": {
      typeName: "Facebook Group",
      configTemplate: JSON.stringify({
        groupId: "",
        apiKey: ""
      })
    },
    "gmail": {
      typeName: "Gmail",
      configTemplate: JSON.stringify({
        toField: "",
        ccField: "",
        bccField: ""
      })
    }
  },

  getPubconfTagNameFor: function(name) {
    console.log("responding with pubconf tagname for: " + name);
    return "pubconf-" + name;
  },

  getWorkerFor: function(name) {
    var worker = Workers[name];
    if (worker) {
      return worker;
    } else {
      console.error("worker for publisher type/name " + name + " does not exist!");
      return null;
    }
  }
}

var Store = {
  publishers: null,
  post: null,
  watchHash: {
    secondaryLocs: {}
  },

  init: function() {
      var pubListJson = localStorage.getItem("publishers");
      if (pubListJson) {
        this.publishers = JSON.parse(pubListJson);
      } else {
        this.publishers = [];
        localStorage.setItem("publishers", "[]");
        localStorage.setItem("publishers_idCount", "0");
      }

      var postJson = sessionStorage.getItem("post");
      if (postJson) {
        this.post = JSON.parse(postJson);
      } else {
        this.resetPost();
      }

      for (var i=0; i < this.post.secondaryLocs.length; i++) {
        var d = this.post.secondaryLocs[i].publisherId;
        this.watchHash.secondaryLocs[d] = true;
      }
  },

  allowedAsPrimaryPublishers: function() {
    return this.publishers.filter(function(x) {
      return x.allowedAsPrimary;
    });
  },

  availPublishersForSecondaryLoc: function() {
    var self = this;
    return self.publishers.filter(function(x) {
      if (self.post.primaryLoc && x.publisherId == self.post.primaryLoc.publisherId) {
        return false;
      } else if (self.watchHash.secondaryLocs[x.publisherId]) {
        return false;
      } else {
        return true;
      }
    });
  },

  addSecondaryLocToPost: function(publisherId) {
    if (!this.watchHash.secondaryLocs[publisherId]) {
      var publisher = this.findPublisher(publisherId);
      this.post.secondaryLocs.push(publisher);
      this.watchHash.secondaryLocs[publisherId] = true;
      this.commitChangesInPost();
    }
  },

  removeSecondaryLocFromPost: function(publisherId) {
    if (this.watchHash.secondaryLocs[publisherId]) {
      for (var i=0; i < this.post.secondaryLocs.length; i++) {
        var x = this.post.secondaryLocs[i];
        if (x.publisherId == publisherId) {
          this.post.secondaryLocs.splice(i, 1);
          this.watchHash.secondaryLocs[publisherId] = undefined;
          this.commitChangesInPost();
        }
      }
    }
  },

  resetPost: function() {
      this.post = {
        secondaryLocs: [],
        primaryLoc: null,
        existingPrimaryUrl: "",
        title: "",
        blurb: "",
        fullText: ""
      }
      this.watchHash.secondaryLocs = {};
      this.commitChangesInPost();
  },

  commitChangesInPost: function() {
    sessionStorage.setItem("post", JSON.stringify(this.post));
  },

  addPublisher: function(publisherType) {
    console.log("Adding publisher of type: " + publisherType);
    publisherTypeConf = App.PUBLISHER_TYPES[publisherType];
    if (publisherTypeConf) {
      publisherConfig = JSON.parse(publisherTypeConf.configTemplate);
      var newId = parseInt(localStorage.getItem("publishers_idCount")) + 1;
      publisherConfig.publisherType = publisherType;
      publisherConfig.publisherId = newId;
      publisherConfig.publisherName = publisherTypeConf.typeName + " (" + newId + ")";
      publisherConfig.allowedAsPrimary = false;
      this.publishers.push(publisherConfig)
      localStorage.setItem("publishers", JSON.stringify(this.publishers));
      localStorage.setItem("publishers_idCount", newId.toString());
    } else {
      console.log("E: Attempted to add publisher with invalid publisher type: " + publisherType);
    }
  },

  commitChangesInPublishers: function() {
    localStorage.setItem("publishers", JSON.stringify(this.publishers));
  },

  findPublisher: function(publisherId) {
    for (var i=0; i < this.publishers.length; i++) {
      var x = this.publishers[i];
      if (x.publisherId == publisherId) {
        return x;
      }
    }
  },

  removePublisher: function(publisherId) {
    for (var i=0; i < this.publishers.length; i++) {
      var x = this.publishers[i];
      if (x.publisherId == publisherId) {
        this.publishers.splice(i, 1);
        localStorage.setItem("publishers", JSON.stringify(this.publishers));
        return publisherId;
      }
    }
    console.log("E: Attempted to remove publisher that does not exist: " + publisherId);
    return null;
  }
};

var Publishing = {
  post: null,
  stat: -2, // -2 for not publishing, -1 for primary, 0..(n-1) for the nth publisher (index in an array style)
  primaryUrl: null, // the primaryUrl, either retrieved after posting to primaryLoc, or inputted as part of post
  waitingOnOauth: false,
  dat: {}, // map of publisherId to a state object holding jsoConfigs, etc.
  cbjso: null,

  init: function() {
    var jsonData = sessionStorage.getItem("publishing");
    if (jsonData) {
      var data = JSON.parse(jsonData);
      this.post = data.post;
      this.stat = data.stat;
      this.dat = data.dat;
      this.primaryUrl = data.primaryUrl;
      this.waitingOnOauth = data.waitingOnOauth;
    } // otherwise, leave as is -- we've already initialized to initial state
  },

  commit: function() {
    var jsonData = JSON.stringify({
      post: this.post,
      stat: this.stat,
      dat: this.dat,
      primaryUrl: this.primaryUrl,
      waitingOnOauth: this.waitingOnOauth
    });
    sessionStorage.setItem("publishing", jsonData);
  },

  begin: function() {
    this.post = Store.post;
    Store.resetPost();
    if (!this.post.existingPrimaryUrl) {
      this.stat = -1;
    } else {
      this.primaryUrl = this.post.existingPrimaryUrl;
      this.stat = 0;
    }
    this.commit();
    this.trigger("stat");
  },

  next: function() {
    this.stat += 1;
    var currentPubconf = this.getCurrentPubConf();
    if (!currentPubconf) {
      this.stat = -2;
    }
    this.commit();
    this.trigger("stat");
  },

  cancel: function() {
    this.stat = -2;
    this.commit();
    this.trigger("stat");
  },

  getCurrentPubConf: function() {
    if (this.stat == -1) {
      if (this.post.primaryLoc) {
        return this.post.primaryLoc;
      } else {
        console.log("[Publishing] WARN: attempted getting primary pubconf (stat: -1) for a post that has no primaryLoc!");
      }
    } else if (this.stat >= 0) {
      if (this.stat < this.post.secondaryLocs.length) {
        return this.post.secondaryLocs[this.stat];
      } else {
        console.log("[Publishing] WARN: attempted getting a secondary pubconf (stat: " + this.stat + ") outside the bounds of the post's secondaryLocs!");
      }
    } else {
      console.log("[Publishing] WARN: attempted getting a pubconf while publishing is not active! (stat: " + this.stat + ")");
    }
    return null;
  },

  getDat: function(publisherId) {
    var x = this.dat[publisherId];
    if (x == undefined) {
      var n = {};
      this.dat[publisherId] = n;
      return n;
    } else {
      return x;
    }
  },

  processRoute: function(onPublishRoute) {
    // returns whether I "processed" a publishing route (allowing callers to know if they need to continue with their routing -- that is if I didn't "process" it)
    if (this.waitingOnOauth) {
      var pub = this.getCurrentPubConf();
      var pubdat = this.getDat(pub.publisherId);
      var jsoConfig = pubdat.jsoConfig;
      if (jsoConfig) {
        var jso = new JSO(jsoConfig);
        jso.callback();
        this.cbjso = jso;
      } else {
        console.log("[Publishing] WARN: supposedly wating on OAuth, but there's no jsoConfig available for this publisherId!");
      }
      this.waitingOnOauth = false;
      this.commit();
    }

    if (this.stat >= -1 && !onPublishRoute) {
      riot.route("publish");
      return true;
    } else {
      return false;
    }
  }
};

riot.observable(App);
window.onbeforeunload = function() {
  App.trigger("unload");
}

riot.observable(Store);
Store.init();

riot.observable(Publishing);
Publishing.init();

riot.mount("pm-appbar");

JSO.enablejQuery($);
