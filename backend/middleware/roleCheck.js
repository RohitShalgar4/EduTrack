// const isSuperAdmin = (req, res, next) => {
//   if (req.user && req.user.role === 'super_admin') {
//     next();
//   } else {
//     res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
//   }
// };

// module.exports = {
//   isSuperAdmin
// }; 