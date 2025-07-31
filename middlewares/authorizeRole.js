// middlewares/authorizeRole.js
export const isSuperAdmin = (req, res, next) => {
   if (req.user?.role !== "superadmin") {
      return res.status(403).json({
         message: "Access denied: Superadmin only",
      });
   }
   next();
};

export const isAdmin = (req, res, next) => {
   if (req.user?.role !== "admin") {
      return res.status(403).json({
         message: "Access denied: Admin only",
      });
   }
   next();
};
