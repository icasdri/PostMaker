riot.route("/", function() {
  if (!Publishing.processRoute(false)) {
    console.log("Redirecting to /create");
    riot.route("/create");
  }
});

riot.route("/create", function() {
  if (!Publishing.processRoute(false)) {
    riot.mount("pm-view", "post-creator");
  }
});

riot.route("/configure", function() {
  if (!Publishing.processRoute(false)) {
    riot.mount("pm-view", "configuration-manager");
  }
});

riot.route("/publish", function() {
  Publishing.processRoute(true)
  riot.mount("pm-view", "post-publisher");
});

riot.route("*", function() {
  if (!Publishing.processRoute(false)) {
    riot.route("/");
  }
})

riot.route.start(true);
