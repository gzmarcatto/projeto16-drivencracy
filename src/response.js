import joi from "joi";

import dotenv from "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
const collections = {
  registeredPolls: "registered-polls",
  registeredChoices: "registered-choices",
  registeredVotes: "registered-votes",
};

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db();
});

export async function postNewPoll(req, res) {
  try {
    const newPollInfo = req.body;
    const standardExpireTime = 30 * 24 * 60 * 60 * 1000; // dias * horas * minutos * segundos * milissegundos
    const dataTeste = "2020-02-13 01:00";
    const timestampNewDate = new Date(dataTeste).getTime();
    const newPollSchema = joi.object({
      title: joi.string().required(),
      expireAt: joi.date().allow(null),
    });
    const validateNewPollSchema = newPollSchema.validate(newPollInfo);
    if (validateNewPollSchema.error) {
      const errors = validateNewPollSchema.error.details.map((detail) => detail.message);
      console.log(validateNewPollSchema.error.details);
      return res.status(422).send(errors);
    }
    if (!newPollInfo.expireAt) {
      newPollInfo.expireAt = Date.now();
    } else {
      newPollInfo.expireAt = new Date(newPollInfo.expireAt).getTime();
    }
    console.log(Date(newPollInfo.expireAt));
    newPollInfo.expireAt = newPollInfo.expireAt + standardExpireTime;
    await db.collection(collections.registeredPolls).insertOne(newPollInfo);
    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
  }
}

export async function getPoll(req, res) {
  try {
    const getRegisteredPolls = await db.collection(collections.registeredPolls).find().toArray();
    getRegisteredPolls.map((poll) => {
      const formatDate = new Date(poll.expireAt);
      const year = formatDate.getFullYear();
      const month = (formatDate.getMonth() + 1).toString().padStart(2, "0");
      const day = formatDate.getDate().toString().padStart(2, "0");
      const hour = formatDate.getHours().toString().padStart(2, "0");
      const minute = formatDate.getMinutes().toString().padStart(2, "0");
      poll.expireAt = `${year}-${month}-${day} ${hour}:${minute}`;
    });
    if (!getRegisteredPolls) return res.sendStatus(401);
    return res.status(200).send(getRegisteredPolls);
  } catch (error) {
    console.log(error);
  }
}

export async function postChoice(req, res) {
  try {
    const { title, pollId } = req.body;

    //validação dos inputs
    const choiceSchema = joi.object({
      title: joi.string().required(),
      pollId: joi.any(),
    });
    const validateChoiceSchema = choiceSchema.validate({ title: title, pollId: pollId });
    if (validateChoiceSchema.error) {
      const errors = validateChoiceSchema.error.details.map((detail) => detail.message);
      console.log(validateChoiceSchema.error.details);
      return res.status(422).send(errors);
    }

    //verifica existência da poll e se está ativa
    const existsPoll = await db
      .collection(collections.registeredPolls)
      .findOne({ _id: new ObjectId(pollId) });
    if (!existsPoll) {
      return res.sendStatus(404);
    } else {
      const today = Date.now();
      if (today > existsPoll.expireAt) return res.sendStatus(403);
    }

    //verifica escolha repetida
    const repeatedPollChoices = await db
      .collection(collections.registeredChoices)
      .findOne({ pollId: pollId, title: title });
    if (repeatedPollChoices) {
      return res.sendStatus(409);
    }
    const newPollChoice = {
      pollId: pollId,
      title: title,
    };
    await db.collection(collections.registeredChoices).insertOne(newPollChoice);
    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
  }
}

export async function getChoice(req, res) {
  try {
    const pollId = req.params.id;
    const allChoicesById = await db
      .collection(collections.registeredChoices)
      .find({ pollId: pollId })
      .toArray();
    if (allChoicesById.length === 0) return res.sendStatus(404);
    return res.send(allChoicesById);
  } catch (error) {
    console.log(error);
  }
}

export async function postChoiceVote(req, res) {
  try {
    const choiceId = req.params.id;

    const IdSchema = joi.string().length(24);
    const validateIdSchema = IdSchema.validate(choiceId);
    if (validateIdSchema.error) {
      const errors = validateIdSchema.error.details.map((detail) => detail.message);
      console.log(validateIdSchema.error.details);
      return res.status(422).send(errors);
    }

    const existsChoiceId = await db
      .collection(collections.registeredChoices)
      .findOne({ _id: new ObjectId(choiceId) });
    if (!existsChoiceId) return res.sendStatus(404);

    const existsPoll = await db
      .collection(collections.registeredPolls)
      .findOne({ _id: new ObjectId(existsChoiceId.pollId) });
    const today = Date.now();
    if (today > existsPoll.expireAt) return res.sendStatus(403);

    await db.collection(collections.registeredVotes).insertOne({
      pollId: existsPoll._id.toString,
      choiceTitle: existsChoiceId.title,
      timestamp: today,
    });

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
  }
}

export async function listenServer(PORT) {
  console.log(`Servidor rodando na porta ${PORT}`);
}
