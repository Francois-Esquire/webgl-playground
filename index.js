const { spawn } = require("child_process");
const fs = require("fs");
const express = require("express");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static("public"));

app.get("/*", (request, response) => {
  const html = fs.createReadStream("public/index.htm");

  html.on("end", () => {
    response.end("", 200);
  });

  html.pipe(response);
});

app.listen(port, error => {
  if (error) console.log(error);
  else {
    console.log("server listening on %s", port);

    if (process.env.NODE_ENV !== "production")
      spawn("rollup", ["-c", "-w"], { stdio: "inherit" });
  }
});
