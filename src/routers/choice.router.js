import { Router } from "express";
import * as choiceController from "../controllers/choice.controller.js";
import { choiceSchema } from "../schemas/choice.schema.js";
import { validateSchemaMiddleware } from "../middlewares/index.js";

const choiceRouter = Router();

choiceRouter.post(`/choice`, validateSchemaMiddleware(choiceSchema), choiceController.postChoice);
choiceRouter.get(
  `/poll/:id/choice`,
  validateSchemaMiddleware(choiceSchema),
  choiceController.getChoice
);
choiceRouter.post(
  `/choice/:id/vote`,
  validateSchemaMiddleware(choiceSchema),
  choiceController.postChoiceVote
);
choiceRouter.get(
  `/poll/:id/result`,
  validateSchemaMiddleware(choiceSchema),
  choiceController.getResult
);

export default choiceRouter;
