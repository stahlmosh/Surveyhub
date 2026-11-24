const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Access denied: role '${req.user?.role || 'unknown'}' is not permitted`)
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };
