const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
// const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const cookieParser = require("cookie-parser");
const AppError = require("./utils/appError");
const golbalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();

// pug is a templating engine designed to render HTML in server-side
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 1) GLOBAL MIDDLEWARES
// serving static files
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(`${__dirname}/public`));

// set security HTTP headers
app.use(helmet());

const scriptSrcUrls = [
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://*.cloudflare.com",
  "https://js.stripe.com/v3/",
  "https://checkout.stripe.com",
];
const styleSrcUrls = [
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*",
  " checkout.stripe.com",
];
const connectSrcUrls = [
  "https://*.mapbox.com/",
  "https://*.cloudflare.com",
  "http://127.0.0.1:3001",
  "http://localhost:3001",
  "http://127.0.0.1:52191",
  "*.stripe.com",
  "*.stripe.com/v3",
];

const fontSrcUrls = ["fonts.googleapis.com", "fonts.gstatic.com"];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:"],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["*.stripe.com", "*.stripe.network"],
    },
  }),
);

console.log("NODE ENVIRONMENT:", process.env.NODE_ENV);
// development logging
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}
//    limit hte request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// data sanitization against nosql query injection
// app.use(mongoSanitize);
// data sanitization against XSS (cross-site-scripting attacks)

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ROUTES

app.use("/", viewRouter);

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", createTour);
// app.post("/api/v1/tours", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

app.all("*", (req, res, next) => {
  //        hendle errors no 1      /////////// 1
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server ! 💥💥`,
  // });
  //        hendle errors no 2      /////////// 2
  // const error = new Error(
  //   `Can't find ${req.originalUrl} on this server ! 💥💥`,
  // );
  // error.status = "fail";
  // error.statusCode = 404;
  // next(error);
  //        hendle errors no 3      /////////// 3
  next(
    new AppError(`Can't find ${req.originalUrl} on this server ! 💥💥`, 404),
  );
});

app.use(golbalErrorHandler);

module.exports = app;
