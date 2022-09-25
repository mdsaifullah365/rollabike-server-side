const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/dbConnect');

module.exports.getAllProducts = async (req, res) => {
  try {
    const db = getDb();

    const result = await db.collection('products').find({}).toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.postAProduct = async (req, res) => {
  try {
    const db = getDb();
    const product = req.body;

    const result = await db.collection('products').insertOne(product);

    if (!result.insertedId) {
      console.log(err);
      return;
    }

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.getProductDetails = async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res
        .send(400)
        .json({ success: false, error: 'Product ID is invalid' });
    }

    const query = { _id: ObjectId(id) };
    const result = await db.collection('products').findOne(query);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.updateAProduct = async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res
        .send(400)
        .json({ success: false, error: 'Product ID is invalid' });
    }

    const query = { _id: ObjectId(id) };
    const available = req.body.available;

    const updateDoc = {
      $set: {
        available: available,
      },
    };

    const result = await db.collection('products').updateOne(query, updateDoc);

    res.send(result);
  } catch (error) {
    console.log(error);
  }

  res.send('product updated');
};
