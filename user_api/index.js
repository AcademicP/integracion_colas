const express = require("express")

const app = express()
app.use( express.json() )
const port = 8081
app.get('/', (req, res) => { res.send("I am alive UserAPI"); })

const users = [
  {username:"usuario1", saldo:100},
  {username:"usuario2", saldo:200},
];


app.get("/users", function(req, res){
  res.json(users);
});

app.post("/users", function(req,res){
  /* Codigo para quitar balance */
  res.json({success:true});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
