const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect(
      "mongodb+srv://<DBNAME>:<PASSWORD>@cluster0.4gre4nl.mongodb.net/todo-collection?retryWrites=true&w=majority"
    )
    .then(function () {
      console.log("connect to db");
    })
    .catch(function () {
      console.log("db connection error");
    });
};
