const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const mongoUrl =
  "mongodb+srv://root:tiktik123@cluster0.lhsfo.mongodb.net/?retryWrites=true&w=majority";
const dbName = "shop";

const connect = async () => {
  const client = await mongoClient.connect(mongoUrl);
  const db = client.db(dbName);
  return db;
};

module.exports = connect;
