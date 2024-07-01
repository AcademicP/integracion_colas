const express = require("express")
const amqp = require("amqplib")

const app = express()
app.use( express.json() )
const port = 8081
app.get('/', (req, res) => { res.send("I am alive UserAPI"); })

const users = [
  {username:"usuario1", saldo:100},
  {username:"usuario2", saldo:200},
];

async function conectarRabbit(){
  const conn = await amqp.connect("amqp://guest:guest@localhost");
  const channel = await conn.createChannel();
  await channel.assertQueue("bets", {durable:true});
  return channel;
}


async function consumirApuesta(){
  const channel = await conectarRabbit();
  channel.consume("bets", function(msg){
    const bet = JSON.parse(msg.content.toString());
    console.log("APUESTA RECIBIDA",new Date(), bet);
    const user = users.find(e=>e.username==bet.username);
    if(user){ /* */  }
    channel.ack(msg);
  });
}

consumirApuesta();

app.get("/users", function(req, res){
  res.json(users);
});
