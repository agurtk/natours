const AppError = require("../utils/appError");

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const hadleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicte field value: ${value}. please use another value! `;
  return new AppError(message, 400);
};
const haadleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((item) => item.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  //  API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  //  RENDERED WEBSITE
  console.error("Error 💥💥", err);

  res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //  API
  if (req.originalUrl.startsWith("/api")) {
    //      Opreational, trused error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //      Programming or other unknow errorL don't leak error details
    //  1) Log error for developers
    console.error("Error 💥💥", err);
    //  2) Send genric message
    return res.status(500).json({
      status: "error",
      message: "Somting went very worng! 🥺🥺",
    });
  }
  //  RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
    //      Programming or other unknow errorL don't leak error details
  }
  //  1) Log error for developers
  console.error("Error 💥💥", err);
  //  2) Send genric message
  res.status(500).json({
    title: "Somting went wrong!🥺🥺",
    message: "Please try again later",
  });
};

const handleJWTError = () => {
  const message = "Invalid token. Please log in again!";
  return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
  const message = "Your token has expired! Please log in again!";
  return new AppError(message, 401);
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "dev") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);
    if (error.name === "CastError") {
      error = handleCastErrorDb(error);
    } else if (error.code === 11000) {
      error = hadleDuplicateFieldDB(error);
    } else if (error.name === "ValidationError")
      error = haadleValidationErrorDB(error);
    else if (error.name === "JsonWebTokenError") error = handleJWTError();
    else if (error.name === "TokenExpiredError")
      error = handleJWTExpiredError();
    console.log(`
    💥💥💥💥💥💥💥💥💥💥
      name: ${error.name}, 
      status code: ${error.statusCode},
      is operational: ${error.isOperational},
      message: ${error.message}`);
    sendErrorProd(error, req, res);
  }
};
