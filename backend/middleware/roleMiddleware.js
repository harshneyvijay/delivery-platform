const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      next(new Error('Not authorized, no user'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      next(new Error(`User role ${req.user.role} is not authorized to access this route`));
      return;
    }

    next();
  };
};

module.exports = { authorize };
