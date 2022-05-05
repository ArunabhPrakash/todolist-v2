//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item",itemsSchema);
const oneit = new Item({
  name: "Buy food"
});
const twoit = new Item({
  name: "Cook food"
});
const threeit = new Item({
  name: "Eat food"
});


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany([oneit,twoit,threeit],function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("success");
        }
      });
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newListItem = new Item({
    name: itemName
  });
  if(listName === "Today"){
    newListItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(newListItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});
app.post("/delete", function(req, res){
  const idToDel = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.deleteOne({_id: idToDel},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");

      }
      res.redirect("/");
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: idToDel}}},function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});
app.get('/:id', function (req, res) {

   queryTitle = req.params.id;
// _.capitalize();
   List.findOne({name:queryTitle},function(err,foundList){
     if(!err){
       if(!foundList){
         const list = new List({
           name: queryTitle,
           items: [oneit,twoit,threeit]

         });
         list.save();
         res.redirect("/"+queryTitle)
       }
       else{
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
       }
     }
   });



});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
