export function validateSchemaMiddleware(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const error = error.details[0].message;
      res.status(422).send(error);
    }
    next();
  };
}
