const express = require("express")
const amqp = require("amqplib")

const app = express()
app.use( express.json() )
const port = 8080
app.get('/', (req, res) => { res.send("I am alive GameAPI"); })

const exchange = 'bets_exchange';   
const queue1m = 'bets_delayed_1m';
const queue10m = 'bets_delayed_10m';
const queue1h = 'bets_delayed_1h';
const queue1d = 'bets_delayed_1d';
const finalQueue = 'bets';  

async function connectRabbit(){
  const conn= await amqp.connect("amqp://guest:guest@localhost");
  const channel = await conn.createChannel();
  await channel.assertExchange(exchange, 'direct', { durable: true });  

  
  /*Para reenvio de colas */
  await channel.assertQueue(queue1m, {
      durable: true,
      arguments: {
        'x-message-ttl': 60*1000,
        'x-dead-letter-exchange': exchange,
        'x-dead-letter-routing-key': 'bets_10m'
      }
    });
  
    await channel.assertQueue(queue10m, {
      durable: true,
      arguments: {
        'x-message-ttl': 600*1000,
        'x-dead-letter-exchange': exchange,
        'x-dead-letter-routing-key': 'bets_1h'
      }
    });

    await channel.assertQueue(queue1h, {
      durable: true,
      arguments: {
        'x-message-ttl': 3600*1000,
        'x-dead-letter-exchange': exchange,
        'x-dead-letter-routing-key': 'bets_1d'
      }
    });

    await channel.assertQueue(queue1d, {
      durable: true,
      arguments: {
        'x-message-ttl': 86400*1000,
        'x-dead-letter-exchange': exchange,
        'x-dead-letter-routing-key': 'bets'
      }
    });

    await channel.assertQueue("bets",{durable:true});
    await channel.bindQueue(queue1m, exchange, 'bets_1m');
    await channel.bindQueue(queue10m, exchange, 'bets_10m');
    await channel.bindQueue(queue1h, exchange, 'bets_1h');
    await channel.bindQueue(queue1d, exchange, 'bets_1d');
    await channel.bindQueue(finalQueue, exchange, 'bets');
   return channel;
}

app.post('/bet', async(req, res)=>{
  try {
    const channel= connectRabbit();
    console.log("Llego la apuesta", req.body);
    //TODO: guardar en mi BD.
    let msg = req.body;
    msg.dateAt=new Date();
    //await chanel.sendToQueue("bets", Buffer.from(JSON.stringify(req.body)) )
    await channel.publish(exchange, 'bets_1m', Buffer.from(JSON.stringify(apuesta)));
      
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


/*--------------Queue Manager */
async function consumirApuesta(){
  const channel = await connectRabbit();
  console.log("Conectado A Rabbit");
  channel.consume("bets", function(msg){
    const bet = JSON.parse(msg.content.toString());
    console.log("APUESTA RECIBIDA",new Date(), bet);
    
    //axios enviar RESTAR de descuento a USER_API
    axios.post("http://localhost:8081/users",bet);
    channel.ack(msg);
  });
}

consumirApuesta();

