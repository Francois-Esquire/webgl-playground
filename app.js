'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var stream = _interopDefault(require('stream'));
var React = _interopDefault(require('react'));
var server = require('react-dom/server');
var express = _interopDefault(require('express'));

var experiments = [
	{
		title: "Home",
		description: "XP Lab Gallery",
		path: "/",
		src: "src/home.js",
		file: "public/js/home.js",
		assets: [
		]
	},
	{
		title: "Triangle",
		description: "First Play With Shaders",
		path: "/triangle",
		src: "src/triangle/index.js",
		file: "public/js/triangle.js",
		assets: [
		]
	},
	{
		title: "Strung",
		description: "Pluck The String",
		path: "/strung",
		src: "src/strung/index.js",
		file: "public/js/strung.js",
		assets: [
		]
	},
	{
		title: "Penrose",
		description: "Find The Way Out",
		path: "/penrose",
		src: "src/penrose/index.js",
		file: "public/js/penrose.js",
		assets: [
		]
	}
];
var xp = {
	experiments: experiments
};

var Markup = function Markup() {
  this.cache = new Map();

  this.experiments = xp.experiments.reduce(function (map, x) {
    map.set(x.path, x);

    return map;
  }, new Map());
};

Markup.prototype.render = function render (path) {
  var transform = new stream.Transform({
    transform: function transform(chunk, _, callback) {
      callback(null, chunk);
    }
  });

  if (this.cache.has(path)) {
    transform.write(this.cache.get(path));

    return transform;
  }

  var exp = this.experiments.get(path) || {};

  var markup = (
    React.createElement( 'html', null,
      React.createElement( 'head', null,
        React.createElement( 'meta', { charSet: "utf-8" }),
        React.createElement( 'meta', { name: "viewport", content: "width=device-width, initial-scale=1" }),

        React.createElement( 'title', null, exp.title || "XP Lab" ),

        exp.assets &&
          exp.assets.map(
            function (src) { return src.endsWith(".js") ? (
                React.createElement( 'script', { type: "text/javascript", key: src, src: src })
              ) : src.endsWith(".css") ? (
                React.createElement( 'link', { rel: "stylesheet", key: src, href: src })
              ) : null; }
          ),

        React.createElement( 'script', {
          type: "text/javascript", dangerouslySetInnerHTML: {
            __html: "var s = document.createElement(\"style\"); s.type=\"text/css\"; s.innerText=\"noscript{display:none}\"; document.head.appendChild(s);"
          } }),

        React.createElement( 'link', { rel: "stylesheet", href: "styles.css" })
      ),

      React.createElement( 'body', null,
        React.createElement( 'noscript', null,
          React.createElement( 'p', null, "Please Enable Javascript" )
        ),

        exp.path === "/" && (
          React.createElement( 'main', { className: "gallery" },
            React.createElement( 'header', { className: "intro" },
              React.createElement( 'h1', null, "XP" ),
              React.createElement( 'p', null, "Exploring WebGL & All The Goodness Of The Web" )
            ),

            React.createElement( 'div', { className: "container" },
              Array.from(this.experiments.values()).map(
                function (xp$$1) { return xp$$1.path !== "/" && (
                    React.createElement( 'a', {
                      key: xp$$1.title, href: ("/" + (xp$$1.title.toLowerCase())), className: "link" },
                      React.createElement( 'section', { className: "experiment" },
                        React.createElement( 'header', { className: "title" },
                          React.createElement( 'h2', null, xp$$1.title )
                        ),

                        React.createElement( 'div', { className: "preview" },
                          React.createElement( 'img', {
                            src: ("images/" + (xp$$1.title.toLowerCase()) + ".png"), alt: xp$$1.title })
                        ),

                        React.createElement( 'footer', { className: "description" },
                          React.createElement( 'p', null, xp$$1.description )
                        )
                      )
                    )
                  ); }
              )
            )
          )
        ),

        React.createElement( 'script', { src: (exp.file || "").replace("public/", "") })
      )
    )
  );

  transform.write("<!DOCTYPE html>");

  return server.renderToStaticNodeStream(markup).pipe(transform);
};

var markup = new Markup();

var app = express();

app
  .use(express.static("public"))
  .use("/assets", express.static("assets"))
  .get("/*", function (request, response) {
    response.type("html");

    var html = markup.render(request.path);

    html
      .on("error", function (error) {
        console.log("Error:", error.message);

        if (response.headersSent) { reponse.end(); }
        else { response.status(500).end(); }
      })
      .on("end", function () {
        response.status(200).end();
      })
      .pipe(response);
  });

module.exports = app;
