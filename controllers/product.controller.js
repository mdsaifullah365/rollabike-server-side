module.exports.getAllProducts = (req, res) => {
  //   const cursor = productCollection.find({});
  //   const result = await cursor.toArray();
  //   res.send(result);

  res.send('product found');
};

module.exports.postAProduct = (req, res) => {
  // const product = req.body;
  // const result = productCollection.insertOne(product);
  // res.send(result);

  res.send('product added');
};

module.exports.getProductDetails = (req, res) => {
  // const id = req.params.id;
  // const query = { _id: ObjectId(id) };
  // const result = await productCollection.findOne(query);
  // res.send(result);

  res.send('got product details');
};

module.exports.updateAProduct = (req, res) => {
  // const id = req.params.id;
  // const query = { _id: ObjectId(id) };
  // const result = await productCollection.findOne(query);
  // res.send(result);

  res.send('product updated');
};
