const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
app.use(cors());
app.use(express.json());

//
//


const uri = "mongodb+srv://gadget-user:s6NojAcH1OuCQE3Y@cluster0.kdohr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("db is connected")

async function run() {
    try {
        await client.connect();
        const collection = client.db('gadgets').collection('devices');
        console.log("inside try")

        /////////JWT TOKEN
        app.post('/login', async (req, res) => {
            const email = req.body;
            console.log(email)
            const token = jwt.sign(email, process.env.ACCESS_TOKEN);
            res.send({ token })
            console.log(token)
        })

        //get api to read all the gadgets
        //http://localhost:5000/
        app.get('/', async (req, res) => {
            const query = req.query;
            console.log(query);
            const cursor = collection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })

        //post api to add all the gadgets
        // http://localhost:5000/addPd
        app.post('/addPd', async (req, res) => {
            const data = req.body;
            const tokenInfo = req.headers.authorization;
            console.log(tokenInfo);
            const [email, acc] = tokenInfo.split(" ");
            const decoded = verifyToken(acc);
           

           
            // console.log(data);
            if (email === decoded.email) {
                const result = await collection.insertOne(data);
                // res.send(result);
                res.send({success:'pd uploaded succefully'})
            }
            else {
                res.send({ success: 'unauthorized access' })
            }

        })

    }
    finally {

    }
}

run().catch(console.dir)


app.listen(port, () => {
    console.log("gadget server is running")
})
//verify token function
function verifyToken(token){
    let email;

    jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
        if(err)
        {
            email='invalid email'
        }
        if(decoded){
            console.log(decoded.email)
            email='decoded'
        }
    })
    return email;
}