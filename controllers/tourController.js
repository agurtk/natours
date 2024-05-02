const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
// const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new AppError("Not an image! Please upload only images.", 400),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload.single('image') 1 image // req.file
// upload.array('images', 5) multiple images with the  same filed name // req.files
//multiple images with different filed names // req.files
exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  // const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) // width, height
    .toFormat("jpeg") // format
    .jpeg({ quality: 90 }) // jpeg options
    .toFile(`public/img/tours/${req.body.imageCover}`); // destination
  // req.body.imageCover = imageCoverFilename;

  // 2) Images in a loop
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (element, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(element.buffer)
        .resize(2000, 1333) // width, height
        .toFormat("jpeg") // format
        .jpeg({ quality: 90 }) // jpeg options
        .toFile(`public/img/tours/${filename}`); // destination
      req.body.images.push(filename);
    }),
  );
  next();
});

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   // try {
//   //   const newTour = new Tour({});
//   //   newTour.save();
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   });
// }); // this line needed becuse the Note
// // } catch (error) {
// //   res.status(400).json({
// //     status: "fail",
// //     message: error,
// //   });
// // }
// // });

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,-ratingAverage";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  //   console.log("alias middlewere");
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // try {
//   //        EXECUTE QUERY
//   const features = new ApiFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.mongoQuery;

//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: { tours },
//   });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: error,
//   //   });
//   // }
// });

exports.getTour = factory.getOne(Tour, { path: "reviews" });
// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   // const tour = await Tour.findById(req.params.id); //           1st way
//   // const tour = await Tour.findById(req.params.id).populate("guides"); // 2nd way
//   const tour = await Tour.findById(req.params.id).populate("reviews"); // 3rd way with populate in the modle
//   // const tour = await Tour.findOne(_id : req.params.id);

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: error,
//   //   });
//   // }
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: error,
//   //   });
//   // }
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(204).json({
//     status: "success",
//     data: null,
//   });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: error,
//   //   });
//   // }
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty", // or null / can use uppercase: _id { $toUpper: "$difficulty" }
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingQuantity" },
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    //   {
    //     $match: { _id: { $ne: "easy" } },
    //   },
  ]);
  res.status(200).json({
    status: "success stats",
    data: stats,
  });
  // } catch (error) {
  //   res.status(404).json({
  //     status: "fail",
  //     message: error,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      //          match is basically like where, it is to select a documents
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" }, // $month get the month value from Date
        numTourStart: { $sum: 1 },
        tours: { $push: "$name" }, //  push number of items to arry
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
      // $sort: { numTourStart: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success monthly-plan",
    data: plan,
  });
  // } catch (error) {
  //   res.status(404).json({
  //     status: "fail monthly-plan",
  //     message: error,
  //   });
  // }
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400,
      ),
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        // if have a multiple fields with geospatial indexes need to use keys parmater
        // key: "startLocation.coordinates",
        near: { type: "Point", coordinates: [lng * 1, lat * 1] },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
