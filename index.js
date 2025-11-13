const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pwy4qnn.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("homenest-db");
    const propertyCollection = db.collection("allproperties");

    app.get("/allProperties", async (req, res) => {
      const result = await propertyCollection.find().toArray();
      res.send(result);
    });

    app.get("/allProperties/:id", async (req, res) => {
      const { id } = req.params;
      const result = await propertyCollection.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    app.put("/allProperties/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const queryId = new ObjectId(id);
      const filter = { _id: queryId };
      const update = {
        $set: data,
      };
      const result = await propertyCollection.updateOne(filter, update);

      res.send(result);
    });

    app.get("/latest-properties", async (req, res) => {
      const cursor = propertyCollection
        .find()
        .sort({ postedDate: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/my-properties", async (req, res) => {
      const email = req.query.email;
      const cursor = propertyCollection.find({ postedByEmail: email });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/allProperties", async (req, res) => {
      const data = req.body;
      const result = await propertyCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
