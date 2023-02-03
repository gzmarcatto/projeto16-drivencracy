import { ObjectId } from "mongodb";
import "../database.js";
import {collections, db} from "../database.js";

export async function postChoice(req, res) {
  try {
    const { title, pollId } = req.body;

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
    return res.sendStatus(500)
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
    return res.sendStatus(500)
  }
}

export async function postChoiceVote(req, res) {
  try {
    const choiceId = req.params.id;

    

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
      pollId: existsPoll._id.toString(),
      choiceTitle: existsChoiceId.title,
      timestamp: today,
    });

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500)
  }
}

export async function getResult(req, res) {
  try {
    const pollId = req.params.id;
    const existsVotes = await db
      .collection(collections.registeredVotes)
      .findOne({ pollId: pollId });
    if (!existsVotes) return res.sendStatus(404);
    const arrayVotes = await db
      .collection(collections.registeredVotes)
      .aggregate([{ $match: { pollId: pollId } }, { $sortByCount: "$choiceTitle" }])
      .toArray();
    const returnPoll = await db
      .collection(collections.registeredPolls)
      .findOne({ _id: new ObjectId(pollId) });
    const { _id, title, expireAt } = returnPoll;
    const result = {
      _id,
      title,
      expireAt,
      result: { title: arrayVotes[0]._id, votes: arrayVotes[0].count },
    };
    console.log(result);
    return res.send();
  } catch (error) {
    console.log(error);
    return res.sendStatus(500)
  }
}