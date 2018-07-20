import express from "express";

import markup from "./markup";

const app = express();

app
  .use(express.static("public"))
  .use("/assets", express.static("assets"))
  .get("/*", (request, response) => {
    response.type("html");

    const html = markup.render(request.path);

    html
      .on("error", error => {
        console.log("Error:", error.message);

        if (response.headersSent) reponse.end();
        else response.status(500).end();
      })
      .on("end", () => {
        response.status(200).end();
      })
      .pipe(response);
  });

export default app;
