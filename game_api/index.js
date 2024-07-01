const express = require("express")
const amqp = require("amqplib")

const app = express()
app.use( express.json() )
const port = 8080
app.get('/', (req, res) => { res.send("I am alive GameAPI"); })

app.post('/bet', async(req, res)=>{
  try {
    const conn= await amqp.connect("amqp://guest:guest@localhost");
    const chanel = await conn.createChannel();
    await chanel.assertQueue("bets",{durable:true});
    console.log("Llego la apuesta", req.body);
    //TODO: guardar en mi BD.
    let msg = req.body;
    msg.dateAt=new Date();
    await chanel.sendToQueue("bets", Buffer.from(JSON.stringify(req.body)) )
    chanel.close()
    conn.close()
    return res.status(201).json({success:true});
  } catch (error) {
    console.log('Error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

