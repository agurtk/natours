class ApiFeatures {
  constructor(mongoQuery, urlQuery) {
    this.mongoQuery = mongoQuery;
    this.urlQuery = urlQuery;
  }

  //1.    FILTERING
  filter() {
    //   const { page, sort, limit, fields, ...queryObj } = this.urlQuery;
    const queryObj = { ...this.urlQuery };
    const exludedFields = ["page", "limit", "sort", "fields"];
    exludedFields.forEach((item) => delete queryObj[item]);

    // console.log(this.urlQuery);

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

    this.mongoQuery = this.mongoQuery.find(queryStr);
    // let tours = Tour.find(queryStr);

    // console.log("hi filter");
    return this;
  }

  //2. SORTING
  sort() {
    if (this.urlQuery.sort) {
      const sortBy = this.urlQuery.sort.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.sort(sortBy);
    } else {
      this.mongoQuery = this.mongoQuery.sort("-createdAt");
    }
    // console.log("hi sort");
    return this;
  }

  limitFields() {
    if (this.urlQuery.fields) {
      const fields = this.urlQuery.fields.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.select(`${fields}`);
    } else {
      this.mongoQuery = this.mongoQuery.select("-__v");
    }
    // console.log("hi limit");
    return this;
  }

  paginate() {
    const page = +this.urlQuery.page || 1;
    const limit = +this.urlQuery.limit || 100;
    const skip = (page - 1) * limit;

    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    // if (this.urlQuery.page) {
    //   const numTours = await this.mongoQuery.countDocuments();
    //   if (skip >= numTours) {
    //     throw new Error("This page does not exist !");
    //   }
    // }
    // console.log("hi pageinate");
    // console.log(this.mongoQuery);
    return this;
  }
}

module.exports = ApiFeatures;
