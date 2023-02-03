import Joi from "joi";

export const choiceSchema = Joi.object({
  title: Joi.string().required(),
  pollId: Joi.string().length(24),
});

// export default function validateChoiceSchema(choiceSchema) {
//   return (req, res, next) => {
//     const { error } = choiceSchema.validate(req.body);
//     if (error) {
//       const errors = validateChoiceSchema.error.details.map((detail) => detail.message);
//       console.log(validateChoiceSchema.error.details);
//       res.status(422).send(errors);
//     }
//     next()
//   };
// }
