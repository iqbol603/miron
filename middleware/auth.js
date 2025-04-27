// middleware/auth.js
// require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }
  const token = header.split(' ')[1];
  console.log("token",token);
  try {
    console.log("secret",process.env.JWT_SECRET);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
console.log('✅ JWT payload:', payload);
req.user = { id: payload.userId };
next();
  } catch {
    return res.status(401).json({ error: 'Неверный токен!!!' });
  }
};
