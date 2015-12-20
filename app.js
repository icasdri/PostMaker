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
        categories: []
      })
    }
  }
}

var Store = {
  addPublisher: function(publisherType) {
    publisherTypeConf = AppConf.PUBLISHER_TYPES[publisherType];
    publisherConfig = JSON.parse(publisherTypeConf.configTemplate);
    if (configTemplate) {
      var pubListJson = localStorage.getItem("publishers");
      if (pubListJson) {
        var pubList = JSON.parse(pubListJson);
      } else {
        var pubList = [];
      }
      var newId = pubList.length;
      publisherConfig.publisherType = publisherType;
      publisherConfig.publisherId = newId;
      publisherConfig.publisherName = publisherTypeConf.typeName + " - " + newId;
      pub_list.push(newId);
      localStorage.setItem("publishers", JSON.stringify(pubList));
      localStorage.setItem("publisher:" + newId, JSON.stringify(publisherConfig));
    } else {
      console.log("E: Attempted to add publisher with invalid publisher type: " + publisherType);
    }
  },
  removePublisher: function(publisherId) {
    var pubListJson = localStorage.getItem("publishers");
    if (pubListJson) {
      var pubList = JSON.parse(pubListJson);
      var index = pubList.indexOf(publisherId);
      if (index >= 0) {
        pubList.splice(index);
        localStorage.removeItem("publisher:" + publisherId);
        localStorage.setItem("publishers", JSON.stringify(pubList));
      } else {
        console.log("E: Attempted to remove publisher that does not exist: " + publisherId);
      }
    } else {
      console.log("E: Attempted to remove publisher with uninitialized publisher storage.");
    }
  },
  getPublisher: function(publisherId) {
    return localStorage.getItem("publisher:" + publisherId);
  },
  getAllPublisherIds: function() {
    return localStorage.getItem("publishers");
  }
};

riot.observable(Store);

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
