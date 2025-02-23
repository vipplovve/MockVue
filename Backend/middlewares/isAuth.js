const isAuth = (req, res, next) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
  };
  
  module.exports = isAuth;
  