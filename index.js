const express = require('express')
const cors = require('cors')
require('dotenv').config()
const jwt=require('jsonwebtoken')
const app = express()
const port =process.env.PORT|| 5000

app.use(express.json())
app.use(cors())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.jobDB}:${process.env.password}@cluster0.ugmduxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



const verifyJWT=(req,res,next)=>{
  console.log('hitting server')
 //  console.log(req.headers.authorize)
   const authorize=req.headers.authorize;
   if (!authorize) {
     return res.status(401).send({error:true,message:'unauthorize access'})
   }
   const token = authorize.split(' ')[1]
   console.log(token)
   jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
     if(error){
      return res.status(401).send({error: true , message:"unauthorize access"})
     }
     req.decoded=decoded
     next()
   })
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const database = client.db("JobDB");
    const jobs = database.collection("JobData");
    const apply = database.collection("apply");



    app.post('/jobs',async(req,res)=>{
         const createData=req.body;
         const result=await jobs.insertOne(createData)
         res.send(result)
    })
    app.post('/applys',async(req,res)=>{
         const createData=req.body;
         const result=await apply.insertOne(createData)
         res.send(result)
    })

    
    app.post('/jwt',(req,res)=>{
      const user= req.body;
      console.log(user)
      const token= jwt.sign(user,process.env.ACCESS_TOKEN,{
        expiresIn:'2000h'
      });
      console.log(token)
      res.send({token})
  
     })

     

    app.get('/jobs',async(req,res)=>{
         const result= await jobs.find().toArray()
         res.send(result)
    })
 
    app.delete('/jobs/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await jobs.deleteOne(query)
        res.send(result)
      })
    app.get('/jobs/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await jobs.findOne(query)
        res.send(result)
      })
      app.get('/job', verifyJWT, async (req, res) => {
        const email = req.query.email;
  
        if (!email) {
          res.send([]);
        }
        const query = { email: email };
       
        const result = await jobs.find(query).toArray()
        res.send(result)
      })
      app.get('/apply', verifyJWT, async (req, res) => {
        const email = req.query.email;
  
        if (!email) {
          res.send([]);
        }
        const query = { email: email };
       
        const result = await apply.find(query).toArray()
        res.send(result)
      })
      app.patch('/jobs/:id', async (req, res) => {
        const id = req.params.id;
        const updateDoc = req.body;
        const filter = { _id: new ObjectId(id) };
  
        const result = await jobs.updateOne(filter, { $set: updateDoc })
  
        res.send(result)
  
      })

     


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})