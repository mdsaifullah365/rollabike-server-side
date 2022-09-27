const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/dbConnect');

module.exports.getUserOrders = async (req, res) => {
  try {
    const db = getDb();
    const decodedEmail = req.email;

    const query = { email: decodedEmail };
    const result = await db.collection('orders').find(query).toArray();

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.postAnOrder = async (req, res) => {
  try {
    const db = getDb();
    const order = req.body;

    const result = await db.collection('orders').insertOne(order);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAllOrders = async (req, res) => {
  try {
    const db = getDb();

    const result = await db.collection('orders').find({}).toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.getOrderDetails = async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;

    const query = { _id: ObjectId(id) };
    const result = await db.collection('orders').findOne(query);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const db = getDb();

    const id = req.params.id;
    const { transactionId } = req.body;
    const query = { _id: ObjectId(id) };

    const updatedDoc = {
      $set: {
        paid: true,
        transactionId: transactionId,
      },
    };

    const option = { upsert: true };

    const result = await db
      .collection('orders')
      .updateOne(query, updatedDoc, option);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.deleteAnOrder = async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;

    const query = { _id: ObjectId(id) };
    const result = await db.collection('orders').deleteOne(query);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
