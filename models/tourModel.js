const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name 😎"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
    },
    slug: { type: String },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration 🕧"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        //   only for strings
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: esay, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating nust be above 1"], //   work also work with dates
      max: [5, "Rating nust be below 5"], //   work also work with dates
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price 💵💵💵"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //      THIS ONLY POINTS TO CURRENT DOC ON NEW DOCUMENT CREATION
        //      NOT WORK WITH UPDATE
        //      have a libraries in npm like validator
        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price ({VALUE}) should be below the regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary 😎"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image 😎"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //   exclude to user
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//    ADD INDEX TO DATA BASE TO IMPROVE QUERY PERFORMANCE
tourSchema.index({ price: 1, ratingsAverage: -1 });
// tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  const weeks = Math.floor(this.duration / 7);
  const days = this.duration % 7;

  if (!weeks) return `${days} days`;
  if (!days) return `${weeks} weeks`;
  return `${weeks} weeks and ${days} days`;
});

//    VIRTUAL POPULATE
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//    DOCUMENT MIDDLEWARE: runs before or after .save() and create(). not on insert.
//    to after use tourSchema.post()
//    called document middleware becuse the this object point on the document
//    if needed to this method use in reguler function
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//this code responsible for performing the //embedding// of guides
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post("save", (doc, next) => {
//   console.log(doc);
//   next();
// });

//    QUERY MIDDLEWARE: runs before or after query executed
//    this keyword point at the query not at the document
//    insted to do this for all find methods use in reguler exprission
// tourSchema.pre("findOne", function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds !`);
  next();
});

tourSchema.pre(/^find/, function (next) {
  //     create a new query might affect performance in a huge applications
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// AGGERGATION MIDDLEWARE
// this- point to aggeration object
// tourSchema.pre("aggregate", function (next) {            /////////////////////////////// NEED TO TURN ON
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
