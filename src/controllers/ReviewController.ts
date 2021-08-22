import * as cheerio from "cheerio";
const puppeteer = require("puppeteer");
import { Response, Request, NextFunction } from "express";
import * as _ from "lodash";
import * as ParseHelper from "../helper/ParseHelper"

export const getTigerDirectReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let url = req.query.reviewUrl ? req.query.reviewUrl.trim() : null;
        if (!_.isNil(url) && !_.isEmpty(url) && url.indexOf("https://www.tigerdirect.com/") > -1) {
            let params = ParseHelper.parseURL(url);
            if (params && params["EdpNo"]) {
                let pageNumber = req.query.page && req.query.page <= 0 ? req.query.page.match(/\d/g).join("") : 1;

                url = `https://www.tigerdirect.com/applications/searchtools/item-details.asp?EdpNo=${params["EdpNo"]}&pagenumber=${pageNumber - 1}&RSort=1&csid=ITD&recordsPerPage=5`
                const content = await ParseHelper.getHTML(url)
                if (content && content.status == "success") {
                    const C = cheerio.load(content.data, {
                        xmlMode: false,
                        decodeEntities: true,
                        recognizeCDATA: false
                    });
                    const $ = C;
                    let prodData = $("#prodinfo")
                    if (!_.isNil(prodData.html()) && !_.isEmpty(prodData.html())) {
                        let reviewTxt: string = $("#reviewtab").text();
                        let reviewCountArr: string[] = reviewTxt.match(/\d/g);
                        if (reviewCountArr) {
                            let reviewCount: number = parseInt(reviewCountArr.join(""));
                            if (!_.isNil(reviewCount) && reviewCount > 0) {
                                let totalReviews = reviewCount;
                                let totalPages = Math.ceil(totalReviews / 5)
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
                                    res.status(200).send({ status: "success", data: { totalReviews: totalReviews, totalPages: totalPages, reviews: formattedReview }, error_message: null })
                                } else {
                                    if (!allReviews) {
                                        res.status(406).send({ status: "success", data: [], error_message: "Invalid Page" })

                                    } else if (allReviews.length == 0) {
                                        res.status(404).send({ status: "success", data: [], error_message: "No review present for the page" })

                                    }
                                }
                            } else {
                                res.status(404).send({ status: "success", data: [], error_message: "No review present for the page" })
                            }
                        } else {
                            res.status(404).send({ status: "success", data: [], error_message: "No review present for the page" })
                        }
                    } else {
                        res.status(406).send({ status: "success", data: [], error_message: "Invalid Page" })
                    }
                } else {
                    res.status(500).send({ status: "fail", error_message: "Internal Server Error. Please contact the website owner" })
                }
            } else {
                res.status(404).send({ status: "success", data: [], error_message: "Invalid Page" })
            }

        } else {
            res.status(400).send({ status: "fail", error_message: "Invalid URL" })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: "fail", error_message: "Internal Server Error. Please contact the website owner" })
        return
    }
}