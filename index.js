const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dbConnect = require('./utils/dbConnect');
const productRoutes = require('./routes/v1/product.route');
const viewCount = require('./middlewares/viewCount');
const { connectToServer } = require('./utils/dbConnect');
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Application level middlewares
app.use(viewCount);

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB
connectToServer((err) => {
  if (!err) {
    app.listen(port, () => {
      console.log('Server is running...');
    });
  } else {
    console.log(err);
  }
});

app.use('/api/v1/product', productRoutes);

async function run() {
  try {
    // await client.connect();
    // const productCollection = client.db('roll-a-bike').collection('products');
    // const orderCollection = client.db('roll-a-bike').collection('orders');
    // const userCollection = client.db('roll-a-bike').collection('users');
    // const reviewCollection = client.db('roll-a-bike').collection('reviews');

    // const db = getDb();

    // const productCollection = db.collection('products');
    // const orderCollection = db.collection('orders');
    // const userCollection = db.collection('users');
    // const reviewCollection = db.collection('reviews');

    // Post an Order
    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // Get all orders of a user
    app.get('/order', verifyToken, async (req, res) => {
      const decodedEmail = req.email;
      const query = { email: decodedEmail };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    // Get all orders
    app.get('/order/all', verifyToken, verifyAdmin, async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    // Delete an Order
    app.delete('/order/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // Get one Order
    app.get('/order/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    // Update an Order when payment successful
    app.put('/order/:id', verifyToken, async (req, res) => {
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
      const result = await orderCollection.updateOne(query, updatedDoc, option);
      res.send(result);
    });

    // Add a review
    app.post('/review', verifyToken, async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // Get all Reviews
    app.get('/review', async (req, res) => {
      const query = {};
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    // Create payment intent
    app.post('/create-payment-intent', verifyToken, async (req, res) => {
      console.log('inside payment intent');
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

    // Get an User
    app.get('/user/:email', verifyToken, async (req, res) => {
      const decodedEmail = req.email;
      const filter = { email: decodedEmail };
      const result = await userCollection.findOne(filter);
      res.send(result);
    });

    // Get all User
    app.get('/user', verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });

    // Update User Info
    app.put('/user/update/:email', verifyToken, async (req, res) => {
      const decodedEmail = req.email;
      const user = req.body;
      const filter = { email: decodedEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // isAdmin
    app.get('/admin', verifyToken, verifyAdmin, (req, res) => {
      res.status(200).send({ admin: true });
    });
    // Make Admin
    app.put('/admin/add/:email', verifyToken, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          role: 'admin',
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Remove Admin
    app.put(
      '/admin/remove/:email',
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
          $set: {
            role: 'user',
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
    );
  } finally {
    // await client.close();
  }
}
// run().catch(console.dir);

app.all('*', (req, res) => {
  res.send('No Route Found');
});

// Port Listening
