const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "../" });
});
app.get("/env", (req, res) => {
  res.sendFile("index.html", { root: "../" });
});

app.use("/src", express.static(__dirname + "/../src/"));
app.use("/res", express.static(__dirname + "/../res/"));
app.use("/lib", express.static(__dirname + "/../lib/"));
app.use("/vendor", express.static(__dirname + "/../vendor/"));
app.use("/env.js", express.static(__dirname + "/../env.js"));

app.listen(3000, () => {
  console.log("listening on 3000");
});
