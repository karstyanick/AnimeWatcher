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
    await page.waitForTimeout('6000');
    const text = await page.content();

    //console.log(text)

    let regex = RegExp('https:\\/\\/monkey-d-luffy\\.site\\/v1\\/files\\?id=[^"]*');
    //let regex = RegExp('https:\\/\\/vidstreaming\\.io\\/streaming\\.php\\?id=[^"]*');
    let match = regex.exec(text);
    await browser.close()
    return match
};

app.get("/", async (req, res) => {
    const url = req.query.url;
    let link = await scrape(url)
    res.send(link[0]);
})

app.get("/cors", async (req, res) =>{
    axios.get(req.query.url, {
    }).then(resp => {
        res.send(resp.data)
    });
})

app.listen(5000)