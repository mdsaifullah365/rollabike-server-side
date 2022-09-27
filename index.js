const express = require('express');
const cors = require('cors');
require('dotenv').config();
const productRoutes = require('./routes/v1/product.route');
const orderRoutes = require('./routes/v1/order.route');
const reviewRoutes = require('./routes/v1/review.route');
const paymentRoutes = require('./routes/v1/payment.route');
const userRoutes = require('./routes/v1/user.route');
const adminRoutes = require('./routes/v1/admin.route');
const { connectToServer } = require('./utils/dbConnect');
const app = express();
const port = process.env.PORT || 5000;

// Application level middleware
// app.use(viewCount);

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
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/create-payment-intent', paymentRoutes);
