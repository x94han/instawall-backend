class APIFeatures {
  constructor(Query, reqQuery) {
    this.query = Query;
    this.reqQuery = reqQuery;
  }

  filter() {
    const qryObj = { ...this.reqQuery };
    const excludedkeys = ["page", "sort", "limit", "fields"];
    excludedkeys.forEach((field) => delete qryObj[field]);

    let qryStr = JSON.stringify(qryObj);
    qryStr = qryStr.replace(
      /\b(gt|gte|lt|lte|exists)\b/,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(qryStr));

    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const sortBy = this.reqQuery.fields.split(",").join(" ");
      this.query = this.query.select(sortBy);
    }

    return this;
  }

  pagination() {
    const page = this.reqQuery.page * 1 || 1;
    const limit = this.reqQuery.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
