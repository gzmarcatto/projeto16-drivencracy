import dotenv from "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
  mongoClient.connect().then(() => {
    db = mongoClient.db();
  });
} catch (error) {
  console.log(error.message);
}

const collections = {
  registeredPolls: "registered-polls",
  registeredChoices: "registered-choices",
  registeredVotes: "registered-votes",
};

export { collections, db };
