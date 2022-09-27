const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/dbConnect');

module.exports.getAllReviews = async (req, res) => {
  try {
    const db = getDb();

    const query = {};
    const result = await db.collection('reviews').find(query).toArray();

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.postAReview = async (req, res) => {
  try {
    const db = getDb();

    const review = req.body;
    const result = await db.collection('reviews').insertOne(review);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
