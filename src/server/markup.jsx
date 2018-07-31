import stream from "stream";
import React from "react";
import { renderToStaticNodeStream } from "react-dom/server";

import xp from "../xp.json";

class Markup {
  constructor() {
    this.cache = new Map();

    this.experiments = xp.experiments.reduce((map, x) => {
      map.set(x.path, x);

      return map;
    }, new Map());
  }

  render(path) {
    const transform = new stream.Transform({
      transform(chunk, _, callback) {
        callback(null, chunk);
      }
    });

    if (this.cache.has(path)) {
      transform.write(this.cache.get(path));

      return transform;
    }

    const exp = this.experiments.get(path) || {};

    const markup = (
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <title>{exp.title || "XP Lab"}</title>

          {exp.assets &&
            exp.assets.map(
              src =>
                src.endsWith(".js") ? (
                  <script type="text/javascript" key={src} src={src} />
                ) : src.endsWith(".css") ? (
                  <link rel="stylesheet" key={src} href={src} />
                ) : null
            )}

          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `var s = document.createElement("style"); s.type="text/css"; s.innerText="noscript{display:none}"; document.head.appendChild(s);`
            }}
          />

          <link rel="stylesheet" href="styles.css" />
        </head>

        <body>
          <noscript>
            <p>Please Enable Javascript</p>
          </noscript>

          {exp.path === "/" && (
            <main className="gallery">
              <header className="intro">
                <h1>XP</h1>
                <p>Exploring WebGL & All The Goodness Of The Web</p>
              </header>

              <div className="container">
                {Array.from(this.experiments.values()).map(
                  xp =>
                    xp.path !== "/" && (
                      <a
                        key={xp.title}
                        href={`/${xp.title.toLowerCase()}`}
                        className="link"
                      >
                        <section className="experiment">
                          <header className="title">
                            <h2>{xp.title}</h2>
                          </header>

                          <div className="preview">
                            <img
                              src={`images/${xp.title.toLowerCase()}.png`}
                              alt={xp.title}
                            />
                          </div>

                          <footer className="description">
                            <p>{xp.description}</p>
                          </footer>
                        </section>
                      </a>
                    )
                )}
              </div>
            </main>
          )}

          <script src={(exp.file || "").replace("public/", "")} />
        </body>
      </html>
    );

    transform.write("<!DOCTYPE html>");

    return renderToStaticNodeStream(markup).pipe(transform);
  }
}

export default new Markup();
