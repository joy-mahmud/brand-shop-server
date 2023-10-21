const express = require('express')
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

//mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7xouwts.mongodb.net/?retryWrites=true&w=majority`;

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
     const brand = client.db('brandShop').collection('brands')
     const productCollection = client.db('brandShop').collection('allProducts')
     const productDetailsCollection = client.db('brandShop').collection('productDetails') 
     const usersCartCollection = client.db('brandShop').collection('usersCart') 
   //get brand name and image
    app.get('/brand', async(req,res)=>{
        const cursor = brand.find()
        const result = await cursor.toArray() 
        res.send(result)
    })
    //get request for finding a specific brand products
    app.get('/brand/:name', async(req,res)=>{
        const brandName = req.params.name.toString()
        
        const filter = {brand:brandName}
        const cursor = productCollection.find(filter)
        const result = await cursor.toArray()
        res.send(result)
    })
    //get an specific product
    app.get('/products/:id', async(req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await productCollection.findOne(query)
        res.send(result)
        
    })
    //get requst for mycart
    app.get('/usersCart/:uid', async(req,res)=>{
        const userId =req.params.uid
        const query = {userId:userId}
        const cursor = usersCartCollection.find(query)
        const result = await cursor.toArray()
        res.send(result) 
    })
    //get product details for a specific product
    app.get('/details/:id', async(req,res)=>{
        const id = req.params.id 
        const query = {model_id:id}
        const result = await productDetailsCollection.findOne(query)
        res.send(result)
    })
    
    //post request to add new products
    app.post('/products', async(req,res)=>{
        const result = await productCollection.insertOne(req.body)
        res.send(result)

    })

    //product details post
    app.post('/details',async(req,res)=>{
        const result = await productDetailsCollection.insertOne(req.body)
        res.send(result)
    })
    //post request for adding cart
    app.post('/usersCart',async(req,res)=>{
        const result = await usersCartCollection.insertOne(req.body)
        res.send(result)
    })
    //patch request to update a product data
    app.patch('/products/:id', async(req,res)=>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const updatedProduct = req.body
        const productDoc = {
            $set: {
                name:updatedProduct.name,
                brand:updatedProduct.brand,
                type:updatedProduct.type,
                price:updatedProduct.price,
                rating:updatedProduct.rating,
                photo:updatedProduct.photo
            },
          };
          const result = await productCollection.updateOne(filter,productDoc)
          res.send(result)
    })
    //delete product from cart
    app.delete('/deleteProduct/:id',async(req,res)=>{
        const id = req.params.id
        const filter = {_id:new ObjectId(id)}
        const result = await usersCartCollection.deleteOne(filter)
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('Brand shop server is running')
})

app.listen(port,()=>{
    console.log(`app is running on port ${port}`)
})


