const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userEmail = req.query.email;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    const decodedEmail = decoded.email;
    if (decodedEmail === userEmail) {
      req.email = decodedEmail;
      next();
    } else {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
  });
};

module.exports = verifyToken;
