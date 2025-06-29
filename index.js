const puppeteer = require("puppeteer");
const express = require("express");
const app = express();

app.get("/", async (req, res) => {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://paypal.chosenenergy.co.th/Account/Login?ReturnUrl=%2Fprepaid%2Findex%2Fcharging", { waitUntil: "networkidle2" });

    await page.type("#Email", email);
    await page.type("#Password", password);
    await Promise.all([
      page.click("button[type='submit']"),
      page.waitForNavigation({ waitUntil: "networkidle2" })
    ]);

    await page.goto("https://paypal.chosenenergy.co.th/prepaid/index/charging", { waitUntil: "networkidle2" });

    await page.evaluate(() => {
      const stopButton = document.querySelector("#btn-stop");
      if (stopButton) stopButton.click();
    });

    res.send("✅ Stop Charging clicked");
  } catch (e) {
    console.error(e);
    res.status(500).send("❌ Failed to stop charging");
  } finally {
    await browser.close();
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
