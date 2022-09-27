const { getDb } = require('../utils/dbConnect');
const jwt = require('jsonwebtoken');

module.exports.getAllUsers = async (req, res) => {
  try {
    const db = getDb();

    const result = await db.collection('users').find({}).toArray();

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.updateUserInfo = async (req, res) => {
  try {
    const db = getDb();

    const decodedEmail = req.email;
    const user = req.body;
    const filter = { email: decodedEmail };
    const options = { upsert: true };

    const updateDoc = {
      $set: user,
    };

    const result = await db
      .collection('users')
      .updateOne(filter, updateDoc, options);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.generateToken = async (req, res) => {
  try {
    const db = getDb();

    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };

    const updateDoc = {
      $set: user,
    };

    const result = await db
      .collection('users')
      .updateOne(filter, updateDoc, options);

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.send({ result, token });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAnUser = async (req, res) => {
  try {
    const db = getDb();

    const decodedEmail = req.email;
    const filter = { email: decodedEmail };

    const result = await db.collection('users').findOne(filter);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
