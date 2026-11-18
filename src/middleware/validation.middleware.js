export const validateRequest = (schema) => (req, res, next) => {
  if (!schema) return next();
  const { error } = schema(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }
  next();
};

export default validateRequest;

