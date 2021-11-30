const express = require("express")
const cors = require("cors")
const app =  express()
const puppeteer = require('puppeteer');


app.set("view engine", "ejs")
app.use(cors())
async function scrape(url) {
    const browser = await puppeteer.launch();
    const page =  await browser.newPage();
    await page.goto(url)
    //await page.waitForSelector('#embed-player');
    await page.waitForSelector('.server-number');
    const text = await page.content();

    //let regex = RegExp('https:\\/\\/monkey-d-luffy\\.site\\/v1\\/files\\?id=[^"]*');
    let regex = RegExp('https:\\/\\/vidstreaming\\.io\\/streaming\\.php\\?id=[^"]*');
    let match = regex.exec(text);
    //console.log(match[0]);
    await browser.close()
    return match
};

app.get("/", async (req, res) => {
    const url = req.query.url;
    let link = await scrape(url)
    console.log(link[0])
    res.send(link[0]);
})

app.listen(5000)