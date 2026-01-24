// Error middleware

module.exports = (err, req, res, next) => {
  // error handling
  res.status(500).send('Something broke!');
};