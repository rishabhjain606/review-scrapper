import * as cheerio from "cheerio";
const requestPromise = require("request-promise")
import * as path from "path";
const puppeteer = require("puppeteer");
import { Response, Request, NextFunction } from "express";
import * as _ from "lodash";


export const getTigerDirectReview= async(req: Request, res: Response, next: NextFunction) => {
    try {
        let url = req.query.reviewUrl ? req.query.reviewUrl.trim() : null;
        if (!_.isNil(url) && !_.isEmpty(url) && url.indexOf("https://www.tigerdirect.com/") > -1) {

            let browser = null;
            try {
                browser = await puppeteer.launch({
                    headless: true,
                    ignoreHTTPSErrors: true,
                    timeout: 60000
                })
            } catch (err) {
                console.log("Error in opening puppeteer");
                res.status(500).send({ status: "fail", error_message: "Internal Server Error. Please contact the website owner" })

            }
            const page = await browser.newPage()
            page.setExtraHTTPHeaders({
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'authority': 'www.tigerdirect.com'
            });
            page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36');
            await page.goto(url)

            const content = await page.content();
            await browser.close()
            const C = cheerio.load(content);
            const $ = C;
            let allReviews = $("#customerReviews>.review").get()
            if (allReviews && allReviews.length > 0) {
                let formattedReview = allReviews.map((o, i) => {
                    let object = $("#customerReviews>.review").get()[i]
                    let ratings = $(object).find(".itemRating>strong").text();
                    let dates = $(object).find(".reviewer>dd").eq(1).text();
                    let reviewerName = $(object).find(".reviewer>dd").eq(0).text();
                    let title = $(object).find("blockquote>h6").text();
                    let comment = $(object).find("blockquote>p").text();
                    return {
                        rating: ratings,
                        date: dates,
                        reviewerName: reviewerName.trim().slice(-1) == "," ? reviewerName.slice(0, -1) : reviewerName,
                        title: title,
                        comment: comment
                    }
                })
                res.status(200).send({ status: "success", data: formattedReview, error_message: null })
            } else {
                res.status(404).send({ status: "success", data: [], error_message: null })
            }
        } else {
            res.status(400).send({ status: "fail", error_message: "Invalid URL" })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: "fail", error_message: "Internal Server Error. Please contact the website owner" })
    }
}