const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const mongoUrl =
  "mongodb+srv://root:tiktik123@cluster0.lhsfo.mongodb.net/?retryWrites=true&w=majority";
const dbName = "shop";

// Do not connect to the database everytime for every operation
let db;

const connect = async () => {
  if (db) {
    return db;
  }
  const client = await mongoClient.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = client.db(dbName);
  return db;
};

module.exports = connect;
