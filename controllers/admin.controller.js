const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/dbConnect');

module.exports.isAdmin = async (req, res) => {
  try {
    res.status(200).send({ admin: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports.makeAdmin = async (req, res) => {
  try {
    const db = getDb();

    const email = req.params.email;
    const filter = { email: email };

    const updateDoc = {
      $set: {
        role: 'admin',
      },
    };

    const result = await db.collection('users').updateOne(filter, updateDoc);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.removeAdmin = async (req, res) => {
  try {
    const db = getDb();

    const email = req.params.email;
    const filter = { email: email };

    const updateDoc = {
      $set: {
        role: 'user',
      },
    };

    const result = await db.collection('users').updateOne(filter, updateDoc);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
