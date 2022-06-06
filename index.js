const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dh0t1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('warehouse').collection('product');
        const myItemCollection = client.db('warehouse').collection('myItems');

        // product API
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // post
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        // delete
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });
        // -------------------------------------------------------------
        // update quantity
        app.put('/product/:_id', async (req, res) => {
            const _id = req.params._id;
            const query = { _id: ObjectId(_id) };
            const updatedQuantity = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedQuantity.deliveredQuantity,
                },
            };
            const result = await productCollection.updateOne(
                query,
                updateDoc,
                options
            );
            const result1 = await productCollection.findOne(query);
            res.send(result1);
        });

        // get logged user data
        app.get("/product", async (req, res) => {
            const email = req.query.email;
            if (email) {
                const query = { email: email };
                const cursor = productCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } else {
                const query = {};
                const cursor = productCollection.find(query);
                const product = await cursor.toArray();
                res.send(product);
            }
        });
        // --------------------------------------------------------------

        // myItems API
        app.get('/myItems', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = myItemCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);
        });

        app.post('myItems', async (req, res) => {
            const myItems = req.body;
            const result = await myItemCollection.insertOne(myItems);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running warehouse management Server');
});

app.listen(port, () => {
    console.log('Listening to warehouse Port', port);
})