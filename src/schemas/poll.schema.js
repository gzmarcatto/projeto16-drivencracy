import Joi from "joi";

export const pollSchema = Joi.object({
  title: Joi.string().required(),
  expireAt: Joi.date().allow(null),
});

// export function validatePollSchema(pollSchema) {
//   console.log(req.body, pollSchema);
//   return (req, res, next) => {
//     const { error } = pollSchema.validate(req.body);
//     if (error) {
//       const errors = validatePollSchema.error.details.map((detail) => detail.message);
//       console.log(validatePollSchema.error.details);
//       res.status(422).send(errors);
//     }
//     next();
//   };
// }
