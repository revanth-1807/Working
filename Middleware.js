// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         // Check if Authorization header exists
//         if (!authHeader) {
//             return res.status(401).send('Authorization header missing');
//         }

//         // Extract token from 'Bearer <token>'
//         const token = authHeader.split(" ")[1];

//         if (!token) {
//             return res.status(401).send('Token missing in Authorization header');
//         }

//         const secretKey = process.env.JWT_SECRET || 'revanth'; // Use environment variable for security

//         // Verify JWT
//         const decoded = jwt.verify(token, secretKey);

//         req.user = decoded.user; // Attach user data to request
//         next(); // Proceed to next middleware/route
//     } catch (err) {
//         console.error('Authentication error:', err.message);
//         return res.status(401).send('Invalid or expired token');
//     }
// };




// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//     try {
//         let token;
//         const authHeader = req.headers.authorization;
//         if (authHeader && authHeader.startsWith('Bearer ')) {
//             token = authHeader.split(' ')[1];
//         } else if (req.query && req.query.token) {
//             token = req.query.token;
//         } else if (req.cookies && req.cookies.token) {
//             token = req.cookies.token;
//         }

//         if (!token) {
//             // Redirect unauthorized user to login page
//             return res.redirect('/login');
//         }

//         const secretKey = process.env.JWT_SECRET || 'revanth';
//         const decoded = jwt.verify(token, secretKey);

//         req.user = decoded.user;
//         next();
//     } catch (err) {
//         console.error('Authentication error:', err.message);
//         // Redirect on invalid or expired token
//         return res.redirect('/login');
//     }
// };

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, 'revanth');
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    return res.redirect('/login');
  }
};

