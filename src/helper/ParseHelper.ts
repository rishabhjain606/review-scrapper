const puppeteer = require("puppeteer");
import * as Constants from "../constants/Constants"
import * as _ from "lodash";

export const getHTML = async (url) => {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        })
    } catch (err) {
        console.log("Error in opening puppeteer");
        return { status: "fail", error_message: "Internal Server Error. Please contact the website owner" }
    }
    if (!_.isNil(browser)) {
        const page = await browser.newPage()
        page.setExtraHTTPHeaders(Constants.TigerHeaders);
        page.setUserAgent(Constants.UserAgent);
        await page.goto(url)
        const content = await page.content();
        await browser.close()
        return { status: "success", data: content }
    } else {
        return { status: "fail", error_message: "Internal Server Error. Please contact the website owner" }
    }
}

export const parseURL = (url: string) => {
    let obj = {}
    if (!_.isNil(url) && !_.isEmpty(url)) {
        let splitUrl = url.split("?");
        url = splitUrl.slice(1, splitUrl.length).join("")
        let splitURL = url.split("&");
        let len = splitURL.length;
        const regexp = /\+/g;

        for (let i = 0; i < len; ++i) {
            let x = splitURL[i].replace(regexp, '%20'),
                idx = x.indexOf("="),
                kstr, vstr, k, v;

            if (idx >= 0) {
                kstr = x.substr(0, idx);
                vstr = x.substr(idx + 1);
            } else {
                kstr = x;
                vstr = '';
            }

            k = decodeURIComponent(kstr);
            v = decodeURIComponent(vstr);

            if (_.isNil(obj[k])) {
                obj[k] = v;
            } else if (Array.isArray(obj[k])) {
                obj[k].push(v);
            } else {
                obj[k] = [obj[k], v];
            }
        }
    }
    return obj;
}
