const Category = require("../models/Category");
const Subscription = require("../models/Subscription");

exports.getCategories = (req, res, next) => {
  Category.find()
    .then((categories) => {
      const categoriesFind = categories.map((category) => {
        return {
          id: category.id,
          handle: category.handle,
          title: category.title,
        };
      });
      console.log(categoriesFind);
      res.json(categoriesFind);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};
