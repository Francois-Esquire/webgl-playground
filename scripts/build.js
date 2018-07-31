const { execSync } = require("child_process");

const exec = (cmd, env = {}) =>
  execSync(cmd, {
    env: { ...process.env, ...env },
    stdio: "inherit",
    cwd: process.cwd()
  });

(async () => {
  exec("rollup -c", { NODE_ENV: "production" });

  const renderPages = true;

  if (renderPages) {
    const xp = require("../src/xp.json");
    const app = require("../app");

    const port = 9898;

    const server = app.listen(port, async err => {
      if (err) console.log(err);
      else {
        const loc = `http://localhost:${port}`;

        console.log(loc);

        try {
          const puppeteer = require("puppeteer");
          const devices = require("puppeteer/DeviceDescriptors");
          const iPad = devices["iPad Pro landscape"];

          const browser = await puppeteer.launch({
            headless: !true,
            args: ["--disable-extensions"],
            dumpio: true
          });

          async function generateGalleryStills(url, name) {
            const page = await browser.newPage();

            await page.emulate(iPad);

            await page.goto(url, { waitUntil: "domcontentloaded" });

            const clip = await page.evaluate(_ => ({
              x: 0,
              y: 0,
              width: document.body.scrollWidth,
              height: document.body.scrollHeight
            }));

            await page.screenshot({
              path: `public/images/${name}.png`,
              clip
            });

            await page.close();
          }

          await Promise.all(
            xp.experiments.map(async exp => {
              const name = exp.title.toLowerCase();
              await generateGalleryStills(`${loc}${exp.path}`, name);
            })
          );

          await browser.close();
        } catch (e) {
          console.log(e);
        }

        server.close();
      }
    });
  }
})();
