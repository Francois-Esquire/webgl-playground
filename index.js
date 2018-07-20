const http = require("http");

const app = require("./app");

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, error => {
  if (error) console.log(error);
  else {
    console.log("server listening on %s", port);

    if (process.env.NODE_ENV !== "production") {
      const { spawn } = require("child_process");

      spawn("rollup", ["-c", "-w"], { stdio: "inherit" });
    }
  }
});
