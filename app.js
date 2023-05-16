//jshint esversion:6
/*
The code you provided is a Node.js application using Express framework and Mongoose library to create a to-do list web application. Let's break it down:
1. `const express = require("express");`, `const bodyParser = require("body-parser");`, `const mongoose = require("mongoose");`, `const _ = require("lodash");`:
   - These lines import the required modules: `express` for creating the web server, `body-parser` for parsing request bodies, `mongoose` for interacting with MongoDB, and `lodash` for utility functions.
2. `const app = express();`:
   - This line creates an instance of the Express application.
3. `app.set('view engine', 'ejs');`:
   - This line sets the view engine to EJS, which will be used to render dynamic content.
4. `app.use(bodyParser.urlencoded({extended: true}));`:
   - This line adds the `body-parser` middleware to parse the URL-encoded request bodies.
5. `app.use(express.static("public"));`:
   - This line serves static files from the "public" directory, allowing you to include CSS, images, and other assets in your application.
6. `mongoose.connect("mongoDb<serverpath>/todolistDB", {useNewUrlParser: true});`:
   - This line connects to the MongoDB database using Mongoose. You need to replace `"mongoDb<serverpath>/todolistDB"` with the actual MongoDB connection string.
7. `const itemsSchema = {name: String};`:
   - This defines the schema for individual to-do items. Each item has a single property called "name" of type String.
8. `const Item = mongoose.model("Item", itemsSchema);`:
   - This creates a Mongoose model named "Item" based on the itemsSchema.
9. `const item1 = new Item({name: "Welcome to your todolist!"});`, `const item2 = new Item({name: "Tap + button to add an item."});`, `const item3 = new Item({name: "click checkbox to delete item."});`:
   - These lines create instances of the Item model with default to-do list items.
10. `const defaultItems = [item1, item2, item3];`:
    - This array contains the default to-do items.
11. `const listSchema = {name: String, items: [itemsSchema]};`:
    - This defines the schema for a list, which has a name (String) and an array of items (based on the itemsSchema).
12. `const List = mongoose.model("List", listSchema);`:
    - This creates a Mongoose model named "List" based on the listSchema.
13. `app.get("/", function(req, res) { ... });`:
    - This route handler handles GET requests to the root URL ("/"). It retrieves the items from the database and renders the "list" view with the found items.
14. `app.get("/:customListName", function(req, res) { ... });`:
    - This route handler handles GET requests to URLs with a custom list name. It finds the corresponding list in the database and renders the "list" view with the items of that list.
15. `app.post("/", function(req, res) { ... });`:
    - This route handler handles POST requests to the root URL ("/"). It creates a new item based on the form input and saves it to the database. If the item is added to the "Today" list, the user is redirected to the root URL. Otherwise, the user is redirected to the custom list URL.
16. `app.post("/delete",
*/
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongoDb<serverpath>/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Tap + button to add an item."
});

const item3 = new Item({
  name: "click checkbox to delete item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started in port 3000 successfully");
});
