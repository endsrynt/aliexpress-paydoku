const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment');
const delay = require('delay');
const readline = require("readline-sync");
const fs = require('fs-extra');

(async () => {


    //input token
    var linklogin = readline.question(chalk.yellow('[?] List account (ex: link): '))

        console.log('\n');
        const read = fs.readFileSync(linklogin, 'UTF-8');
        const list = read.split(/\r?\n/);
        for (var i = 0; i < list.length; i++) {
            var token = list[i];
    console.log(chalk.yellow(`[${(moment().format('HH:mm:ss'))}] Account => ${i}`))    
    console.log(chalk.yellow(`[${(moment().format('HH:mm:ss'))}] Token => ${token}`))

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });
    const page = await browser.newPage();

    await page.setUserAgent(`Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36`);
    console.log(chalk.yellow(`[${(moment().format('HH:mm:ss'))}] Wait for login`))
    

    //login token
    await page.goto(`${token}`,{ waitUntil: 'networkidle2', timeout: 60000 });
    console.log(chalk.green(`[${(moment().format('HH:mm:ss'))}] Login success`))
    

    await page.goto('https://m.id.aliexpress.com/orderlist.html',{ waitUntil: 'networkidle2', timeout: 60000 });

    //get orderid
    await page.waitForSelector("body > div.order-list > amp-list > div.i-amphtml-fill-content.i-amphtml-replaced-content > div > div > div.order-item-head > div.order-item-id",{visible:true,timeout:60000});
    const orderid = await page.evaluate(() => {
    return document.querySelector('body > div.order-list > amp-list > div.i-amphtml-fill-content.i-amphtml-replaced-content > div > div > div.order-item-head > div.order-item-id').innerText
    })        
    const ids = orderid.split(/\r?\n/);
    for (var a = 0; a < ids.length; a++) {
    var id = ids[a].split(':')[1];
    console.log(chalk.green(`[${(moment().format('HH:mm:ss'))}] OrderID : ${id}`))  
    }

    //pay doku
    try {
        await page.click("body > div.order-list > amp-list > div.i-amphtml-fill-content.i-amphtml-replaced-content > div > div > div:nth-child(4) > a > div")
    } catch (err) {
            console.log(chalk.red(`[${(moment().format('HH:mm:ss'))}] ORDER CLOSED`))  
        //save file
        await fs.appendFile('done.txt', `${token};CLOSED`+'\r\n', err => {
            if (err) throw err;
        })
        await browser.close()

        var files = fs.readFileSync(linklogin, 'utf-8');
        var lines = files.split('\n')
        lines.splice(0,1)
        await fs.writeFileSync(linklogin, lines.join('\n'))

        continue;
    }
    
        await delay(5000);
        await page.waitForSelector("#payment > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div",{visible:true,timeout:60000});
        await page.click("#payment > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div");

        await delay(2000);
        await page.waitForSelector("#payment > div > div > div:nth-child(3) > div:nth-child(2)",{visible:true,timeout:60000});
        await page.click("#payment > div > div > div:nth-child(3) > div:nth-child(2)");
                
        await delay(5000);
        await page.waitForSelector("#dw_user", "endsrynt@gmail.com")
        await page.type("#dw_user", "endsrynt@gmail.com")
        await page.waitForSelector("#dw_pass", "polos123321A")
        await page.type("#dw_pass", "polos123321A")
        await page.waitForSelector("#DOKU-SUBMIT-LANG",{visible:true,timeout:60000});
        await page.click("#DOKU-SUBMIT-LANG");

        await delay(5000);
        await page.waitForSelector("#pin", "4215")
        await page.type("#pin", "4215")
        await page.waitForSelector("#form-payment-w > div.default-btn.bg-paybtn.radius.btnsignin-dw > input",{visible:true,timeout:60000});
        await page.click("#form-payment-w > div.default-btn.bg-paybtn.radius.btnsignin-dw > input");
        console.log(chalk.green(`[${(moment().format('HH:mm:ss'))}] Payment Success`))
        await delay(1000)

        //save file
        await fs.appendFile('done.txt', `${token};'${id}`+'\r\n', err => {
            if (err) throw err;
        })
        await browser.close()
    
        var files = fs.readFileSync(linklogin, 'utf-8');
        var lines = files.split('\n')
        lines.splice(0,1)
        await fs.writeFileSync(linklogin, lines.join('\n'))
    
            }}
)();