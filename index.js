const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;

// parser
app.use(cors());
app.use(express.json());

// connect with mongodb
const uri =
  "mongodb+srv://assignment-4:yOi085J4tyzKDkYW@cluster0.whzaso4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    // create a collection on mongodb
    const userCollection = client
      .db("assignment-4")
      .collection("productCollection");
    const cartCollection = client
      .db("assignment-4")
      .collection("cartCollection");

    // fetch all products
    // app.get("/api/products", async (req, res) => {
    //   const data = await userCollection.find().toArray();
    //   res.send(data);
    // });

    // to search a product
    app.get("/api/products", async (req, res) => {
      const searchTerm = req.query.search;
      let query = {};
      if (searchTerm) {
        query = {
          name: { $regex: searchTerm, $options: "i" },
        };
      }
      const products = await userCollection.find(query).toArray();
      res.send(products);
    });

    // fetch single product
    app.get("/api/products/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid product ID format" });
      }
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      if (!result) {
        return res.status(404).send({ error: "Product not found" });
      }
      res.send(result);
    });

    // create a product
    app.post("/api/products", (req, res) => {
      const { name, price, category, image, quantity, description, color } =
        req.body;

      if (
        !name ||
        !price ||
        !category ||
        !image ||
        !quantity ||
        !description ||
        !color
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newProduct = {
        name,
        price,
        category,
        image,
        quantity,
        description,
        color,
      };

      products.push(newProduct);
      res.status(201).json(newProduct);
    });

    //   update the product
    app.put("/api/products/:id", async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID format" });
      }

      const query = { _id: new ObjectId(id) };
      const { name, price, category, image, quantity, description, color } =
        req.body;

      // Validate the request body fields
      if (
        !name ||
        !price ||
        !category ||
        !image ||
        !quantity ||
        !description ||
        !color
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const update = {
        $set: {
          name,
          price,
          category,
          image,
          quantity,
          description,
          color,
        },
      };

      const result = await userCollection.updateOne(query, update);

      if (result.matchedCount === 1) {
        res.json({ message: "Product updated successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    });

    //   delete a product
    app.delete("/api/products/:id", async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID format" });
      }

      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);

      if (result.deletedCount === 1) {
        res.json({ message: "Product removed" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    });

    // ordered product add to database
    app.post("/api/orders", async (req, res) => {
      const order = req.body;

      // Validate order data
      if (
        !order ||
        !order.name ||
        !order.email ||
        !order.cartItems ||
        order.cartItems.length === 0
      ) {
        return res.status(400).json({ message: "Invalid order data" });
      }

      try {
        // Insert the order into the cartCollection
        await cartCollection.insertOne(order);
        return res.status(201).json({ message: "Order placed successfully" });
      } catch (error) {
        console.error("Failed to place order:", error);
        return res.status(500).json({ message: "Failed to place order" });
      }
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Example app is listening on port ${port}`);
});
