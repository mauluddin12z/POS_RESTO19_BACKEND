export const authorizeRoles = (...allowedRoles) => {
   return (req, res, next) => {
      const userRole = req.user?.role;

      if (!userRole) {
         return res.status(401).json({
            message: "Unauthorized: No user role found",
         });
      }

      if (!allowedRoles.includes(userRole)) {
         return res.status(403).json({
            message: `Forbidden: Requires role (${allowedRoles.join(", ")})`,
         });
      }

      next();
   };
};
