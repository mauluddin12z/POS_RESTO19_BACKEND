export const parseJsonFields = (fields = []) => {
    return (req, res, next) => {
        try {
            fields.forEach((field) => {
                if (req.body[field]) {
                    req.body[field] = JSON.parse(req.body[field]);
                }
            });

            next();
        } catch (err) {
            next({
                status: 400,
                message: "Invalid JSON format",
            });
        }
    };
};