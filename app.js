//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your TO DO list!"
});

const item2 = new Item({
  name: "Hit the + button on the right buttom corner to add a new item"
});
const item3 = new Item({
  name: "<= Hit the checkbox to delete an item"
});

const defultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: []
});

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

  Item.find({}).then(function (founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defultItems).then(function () {
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: founditems });
    }

  }).catch(function (err) {
    console.log(err);
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;

  List.findOne({name: customListName}).then(function (foundList){
    if (!foundList){
      console.log("it does not exist");
      const list = new List({
        name : customListName,
        items: defultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: customListName, newListItems: foundList.items });
      console.log("It exists indeed");
    }
    
  }).catch(function (err){
    console.log(err);
  });
});




app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  
  if (listName === "Today") {
    
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
    });
    
    res.redirect("/" +listName);
  }

  
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId).then(function (checkedItemId) {
    console.log("Successfully deleted" + checkedItemId);
  }).catch(function (err) {
    console.log(err);
  });
  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
