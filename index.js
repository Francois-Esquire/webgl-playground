const { spawn } = require("child_process");
const fs = require("fs");
const express = require("express");

const port = process.env.PORT || 3000;

const app = express();

app
  .use(express.static("public"))
  .use("/assets", express.static("assets"))
  .get("/js/three.js", (request, response) => {
    response.type("javascript");

    const three = fs.createReadStream("node_modules/three/build/three.min.js");

    three.pipe(response).on("end", () => response.status(200).end());
  })
  .get("/*", (request, response) => {
    response.type("html");

    const html = fs.createReadStream("public/index.htm");

    html
      .on("error", error => {
        response.status(500);

        console.log("Error:", error.message);

        // respond to error the proper way.
        if (response.headersSent) reponse.end();
        else response.status(500).end();
      })
      .on("end", () => {
        response.status(200).end();
      })
      .pipe(response);
  });

app.listen(port, error => {
  if (error) console.log(error);
  else {
    console.log("server listening on %s", port);

    if (process.env.NODE_ENV !== "production")
      spawn("rollup", ["-c", "-w"], { stdio: "inherit" });
  }
});
