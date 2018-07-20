const { execSync } = require("child_process");

const exec = (cmd, env = {}) =>
  execSync(cmd, {
    env: { ...process.env, ...env },
    stdio: "inherit",
    cwd: process.cwd()
  });

(async () => {
  exec("rollup -c", { NODE_ENV: "production" });

  if (true) {
    const xp = require("../src/xp.json");
    const app = require("../app");

    const port = 3000;

    const server = app.listen(port, async err => {
      if (err) console.log(err);
      else {
        const loc = `http://localhost:${port}`;

        console.log(loc);

        try {
          await Promise.all(
            xp.experiments.map(async exp => {
              const name = exp.title.toLowerCase();
              await generateGalleryStills(`${loc}/${name}`, name);
            })
          );

          await await generateGalleryStills(`${loc}/`, "home");
        } catch (e) {
          console.log(e);
        }

        server.close();
      }
    });
  }
})();

async function generateGalleryStills(url, name) {
  const puppeteer = require("puppeteer");
  const devices = require("puppeteer/DeviceDescriptors");
  const iPad = devices["iPad Pro landscape"];

  const browser = await puppeteer.launch({
    headless: !true,
    args: ["--disable-extensions"],
    dumpio: true
  });

  const page = await browser.newPage();

  await page.emulate(iPad);

  await page.goto(url, {
    waitUntil: "domcontentloaded"
  });

  if (name === "home") {
    // await page.waitFor(4000);
  }

  // await page.emulateMedia("screen");

  const clip = await page.evaluate(_ => ({
    x: 0,
    y: 0,
    width: document.body.scrollWidth,
    height: document.body.scrollHeight
  }));

  await page.screenshot({
    path: `public/images/${name}.png`,
    // fullPage: true,
    clip
  });

  await browser.close();
}
