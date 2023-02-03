import joi from "joi";

import dotenv from "dotenv/config";
import { MongoClient } from "mongodb";
const collections = {
  registeredPolls: "registered-polls",
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
}

export async function postChoice(req, res) {}

export async function listenServer(PORT) {
  console.log(`Servidor rodando na porta ${PORT}`);
}
