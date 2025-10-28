const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
module.exports = generateToken;
