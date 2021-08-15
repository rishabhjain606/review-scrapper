import * as bodyParser from "body-parser";
import * as express from "express";
import { Response, Request, NextFunction } from "express";
import * as dotenv from "dotenv";
import * as ReviewController from "./controllers/ReviewController";

dotenv.config({ path: ".env" });
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("port", process.env.PORT || 4000);

app.listen(app.get("port"), () => {
    console.log(("App is running at http://localhost:%d"), app.get("port"));
});

const wrap = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next).then(next);
  };

app.get("/", async(req: Request, res: Response, next: NextFunction)=>{
    res.status(200).send({ status: "success", data: "App is running at port: " + app.get("port"), error_message: null })
})

app.get("/getReviews", wrap(ReviewController.getTigerDirectReview))