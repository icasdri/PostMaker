/* Copyright 2015 icasdri

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

var AppConf = {
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
    }
  }
}

var Store = {
  publishers: null,
  post: null,

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
  },

  resetPost: function() {
      this.post = {
        secondaryLocs: [],
        primaryLoc: null,
        primaryLocUrl: "",
        primaryLocExisting: true,
        title: "",
        blurb: "",
        fullText: ""
      }
      this.commitChangesInPost();
  },

  commitChangesInPost: function() {
    sessionStorage.setItem("post", JSON.stringify(this.post));
  },

  addPublisher: function(publisherType) {
    console.log("Adding publisher of type: " + publisherType);
    publisherTypeConf = AppConf.PUBLISHER_TYPES[publisherType];
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

riot.observable(Store);
Store.init();

riot.mount("pm-appbar");

riot.route("/", function() {
  console.log("Redirecting to /create");
  riot.route("/create");
});

riot.route("/create", function() {
  riot.mount("pm-view", "post-creator");
});

riot.route("/configure", function() {
  riot.mount("pm-view", "configuration-manager");
});

riot.route.start(true);
