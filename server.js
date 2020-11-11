const express = require("express");
const app = express();
const index = require("./routes/index");

app.set("view engine", "pug");
app.set("trust proxy", 1);

app.use(index);

app.use(express.static("public"));

let listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
