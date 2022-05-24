const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(express.json());
app.use(cors());
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    req.decoded = decoded;
    next();
  });
};

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ds8m7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('roll-a-bike').collection('products');
    const orderCollection = client.db('roll-a-bike').collection('orders');
    const userCollection = client.db('roll-a-bike').collection('users');
    const reviewCollection = client.db('roll-a-bike').collection('reviews');

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (decodedEmail === userEmail) {
        const query = { email: decodedEmail };
        const user = await userCollection.findOne(query);
        if (user.role === 'admin') {
          next();
        } else {
          return res.status(403).send({ message: 'Forbidden Access' });
        }
      } else {
        return res.status(403).send({ message: 'Forbidden Access' });
      }
    };

    // Get All Products
    app.get('/product', async (req, res) => {
      const cursor = productCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get One Product
    app.get('/product/:id', verifyToken, async (req, res) => {
      const tokenEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (tokenEmail === userEmail) {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productCollection.findOne(query);
        res.send(result);
      } else {
        res.status(403).send({ message: 'Forbidden Access' });
      }
    });

    // Update a Product
    app.patch('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const available = req.body.available;
      const updatedDoc = {
        $set: {
          available: available,
        },
      };
      const result = await productCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // Post an Order
    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // Get all orders of a user
    app.get('/order', verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (decodedEmail === userEmail) {
        const query = { email: decodedEmail };
        const result = await orderCollection.find(query).toArray();
        res.send(result);
      }
    });

    // Delete an Order
    app.delete('/order/:id', verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (decodedEmail === userEmail) {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.send(result);
      }
    });

    // Get one Order
    app.get('/order/:id', verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (decodedEmail === userEmail) {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.findOne(query);
        res.send(result);
      }
    });

    // Update an Order when payment successfull
    app.put('/order/:id', verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (decodedEmail === userEmail) {
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
        const result = await orderCollection.updateOne(
          query,
          updatedDoc,
          option
        );
        res.send(result);
      }
    });

    // Add a review
    app.post('/review', verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (decodedEmail === userEmail) {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result);
      }
    });

    // Create payment intent
    app.post('/create-payment-intent', verifyToken, async (req, res) => {
      const { amount } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Update User and generate a JWT Token
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      res.send({ result, token });
    });

    // isAdmin
    app.get('/admin', verifyToken, verifyAdmin, (req, res) => {
      res.status(200).send({ admin: true });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Port Listening
app.listen(port, () => {
  console.log('Server is running...');
});
