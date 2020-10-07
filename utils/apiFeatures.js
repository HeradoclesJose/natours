class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Here we are creating a shallow copy and excluding fields in order to perform the query
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });

    // Filtering, adding the $ needed to perform queries
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Getting the query object
    this.query = this.query.find(JSON.parse(queryStr));

    // Always return object, to allow chaining
    return this;
  }

  sort() {
    // Here we are sorting using multiple variables
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join("x");
      this.query = this.query.sort(sortBy);
    }

    // Always return object, to allow chaining
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    // Always return object, to allow chaining
    return this;
  }

  paginate() {
    // Pagination
    // ?page=2&limit=10 => page 1, 1-10, page 2, 11-20
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // Always return object, to allow chaining
    return this;
  }
}

module.exports = APIfeatures;
