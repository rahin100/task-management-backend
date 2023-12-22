const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
 
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sbbes7k.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const taskCollection = client.db("job-task").collection("tasks");


    app.get("/dashboard/tasks", async (req, res) => {
        const query = req.query;
        const cursor = taskCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

      app.post("/tasks", async (req, res) => {
        const user = req.body;
        const result = await taskCollection.insertOne(user);
        res.send(result);
      });

      app.get("/tasks", async (req, res) => {
        let query = {};
        if (req.query?.email) {
          query = {
            email: req.query?.email,
          };
        }
        const cursor =taskCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

      app.delete("/tasks/:id", async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = {
          _id: new ObjectId(id),
        };
        const result = await taskCollection.deleteOne(query);
        res.send(result);
      });

      app.put("/tasks/:id", async (req, res) => {
        const id = req.params.id;
        const updateTask = req.body.updateTask; // Corrected from req.params.id
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
      
        const updateTasks = {
          $set: {
            email: updateTask.email,
            title: updateTask.title,
            description: updateTask.description,
            deadline: updateTask.deadline,
            priority: updateTask.priority,
            taskStatus: "todo",
          },
        };
      
        try {
          const result = await taskCollection.updateOne(filter, updateTasks, options);
          res.send(result);
        } catch (error) {
          console.error("Error updating task:", error);
          res.status(500).send({ error: "Internal Server Error" });
        }
      });
      







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('job-task-server running......')
})
  
app.listen(port, () => {
    console.log(`job-task-server is running ${port}`)
})



