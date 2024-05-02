const Tour = require("../models/tourModel");

exports.createTour = async (req, res) => {
  try {
    //   const newTour = new Tour({});
    //   newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,-ratingAverage";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //   const { page, sort, limit, fields, ...queryObj } = req.query;
    const queryObj = { ...req.query };
    const exludedFields = ["page", "sort", "limit", "fields"];
    exludedFields.forEach((item) => delete queryObj[item]);

    console.log(req.query);

    //      2 options to query
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: "easy",
    // });
    //      second option
    // const tours = await Tour.find()
    //   .where("duration")
    //   .lte(5)
    //   .where("difficulty")
    //   .equals("easy");

    //      DO QUERY MATCH TO MONGODB
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    let tours = Tour.find(queryStr);

    //2. SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      tours = tours.sort(sortBy);
    } else {
      tours = tours.sort("-createdAt");
    }

    //3.        FIELD LIMITING
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      tours = tours.select(`${fields} -_id`);
    } else {
      tours = tours.select("-__v -_id");
    }

    //4.        PAGIANTION
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const skip = (page - 1) * limit;

    tours = tours.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error("This page does not exist !");
      }
    }
    //        EXECUTE QUERY
    tours = await tours;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: { tours },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // const tour = await Tour.findOne(_id : req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
