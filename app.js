//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shadydeed10x:101198@cluster0-7xfvn.mongodb.net/todolistDB", {useNewUrlParser: true});
//" --username shadydeed10x
const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const playing = new Item({
  name: "Welcome to *To do list* app !"
});
const sleeping = new Item({
  name: "<= Click here to delete the task or Click on + to add task!" 
});

const defaultItems = [playing,sleeping];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();

Item.find({}, function(err, foundItems){
  //console.log(foundItems);
  if(foundItems.length === 0) {
    Item.insertMany(defaultItems, function(err){
      if(err) {
        console.log(err);
      }
      else {
        console.log("Successfuly inserted");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: day, newListItems: foundItems});

  }
});

});

app.get("/:customListName", function(req, res){
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({name: customListName}, function(err, foundList){
     if(!err){
       if(!foundList) {
         const list = new List({
           name: customListName,
           items: defaultItems
         });
         list.save();
         res.redirect("/" +customListName);
       } else {
         res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
       }
     }
   });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if(listName === date.getDate()){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" +listName);
    });
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName === date.getDate()){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err) {
      console.log("Successfuly deleted");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
