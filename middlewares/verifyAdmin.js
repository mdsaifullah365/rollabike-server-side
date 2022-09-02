const verifyAdmin = async (req, res, next) => {
  //   const decodedEmail = req.email;
  //   const query = { email: decodedEmail };
  //   const user = await userCollection.findOne(query);
  //   if (user.role === 'admin') {
  //     next();
  //   } else {
  //     return res.status(403).send({ message: 'Forbidden Access' });
  //   }
};

module.exports = verifyAdmin;
