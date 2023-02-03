import { ObjectId } from "mongodb";
import "../database.js";
import { collections, db } from "../database.js";
import "dotenv/config";

export async function postNewPoll(req, res) {
  try {
    const newPollInfo = req.body;
    const standartExpireAtTime = 30 * 24 * 60 * 60 * 1000;

    if (!newPollInfo.expireAt) {
      newPollInfo.expireAt = Date.now();
    } else {
      newPollInfo.expireAt = new Date(newPollInfo.expireAt).getTime();
    }
    console.log(Date(newPollInfo.expireAt));
    newPollInfo.expireAt = newPollInfo.expireAt + standartExpireAtTime;
    await db.collection(collections.registeredPolls).insertOne(newPollInfo);
    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
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
    return res.sendStatus(500);
  }
}
