const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/Users");
const Product = require("./db/Product");
const app = express();
// const jwt = require("jsonwebtoken");
// const jwtKey = "e-comm";

app.use(express.json());
app.use(cors());

app.post("/singin", async (req, resq) => {
  let data = new User(req.body);
  let result = await data.save();
  result = result.toObject();
  delete result.password;
  // jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
  //   if (err) {
  //     resq.send("something went wrong, please try after sometime ");
  //   }
  //   resq.send({ result, auth: token });
  // });
  resq.send(result)
});

app.post("/login", async (req, resq) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if(user){
      resq.send(user)
    }else{
      resq.send({result : "No User Found"})
    }
  } else {
    resq.send("User Not Found");
  }
});

app.post("/add-product", async (req, resq) => {
  let product = new Product(req.body);
  let result = await product.save();
  resq.send(result);
});

app.get("/products", async (req, resq) => {
  let products = await Product.find();
  if (products.length > 0) {
    resq.send(products);
  } else {
    resq.send({ result: "Product are not found" });
  }
});

app.delete("/product/:id", async (req, resq) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  resq.send(result);
});

app.get("/product/:id", async (res, resq) => {
  let result = await Product.findOne({ _id: res.params.id });
  if (result) {
    resq.send(result);
  } else {
    resq.send("Result not founf");
  }
});

app.put("/product/:id", async (res, resp) => {
  let result = await Product.updateOne(
    { _id: res.params.id },
    {
      $set: res.body,
    }
  );
  resp.send(result);
});

app.get("/search/:key", verifyToken, async (res, resq) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: res.params.key } },
      { company: { $regex: res.params.key } },
      { category: { $regex: res.params.key } },
    ],
  });
  resq.send(result);
});

// function verifyToken(res, resq, next) {
//   // const token = res.headers['authorization']
//   console.log("middleware called");
//   next();
// }

app.listen(5000);
