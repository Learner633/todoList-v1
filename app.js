const express = require("express");
const bodyParser = require("body-parser");
// Requiring Mongoose
const mongoose = require("mongoose");

// Require lodash
const _ = require("lodash");

const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connecting to Mongo DB
mongoose.connect("mongodb+srv://adarisiddhu633:7UiXcWIcUMbmeLGA@cluster0.wbwl4tm.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.set('view engine', 'ejs');

app.get("/", function(req,res){
    
    
    //  TO APPLY DATE //
    // let today = new Date();
    
    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };

    // let day = today.toLocaleDateString("en-US", options);

    Item.find({})
        .then(function(foundItems){
            if(foundItems.length === 0 ){
                Item.insertMany(defaultItems)
                    .then(function(){
                        console.log("1 added defaultItems");
                    })
                    .catch(function(err){
                        console.log(err + ': Err in adding defaultItems(also adding defaultItems every time we start gives this error)');
                    });
                res.redirect("/");
            }
            else{
                res.render('list', {listTitle : "Today", newListItems: foundItems});
            }
        })
        .catch(function(err){
            console.log(err + ': Err in finding Items');
        });
    
});


app.post("/", function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName==="Today") {
        item.save();
        res.redirect("/");    
    } else{
        List.findOne({name: listName})
            .then(function(foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+ listName);
            })
            .catch(function(err){
                console.log(err + ": Err in adding item in custom List");
            });
        }

    
    // if (req.body.list === "Work List") {
    //     workLists.push(item);
    //     res.redirect("/work");    
    // } 
    // else{
    // items.push(item); 
    // res.redirect("/");
    // }    
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const checkedListName = req.body.listName;

    if (checkedListName==="Today") {
        Item.findByIdAndRemove(checkedItemId)
        .then(function(){
            console.log("1 removed based on _id"); 
        })
        .catch(function(err){
            console.log(err + ": Err in removing item based on _id");
        });
        res.redirect("/");
    } else{
        List.findOneAndUpdate({name: checkedListName}, {$pull: {items: {_id: checkedItemId}}})
            .then(function(){
                res.redirect("/"+ checkedListName);
            })
            .catch(function(err){
                console.log(err + ": Err in finding and deleting a list from a custom list");
            });        
    }    
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params['customListName']);
    List.findOne({name: customListName})
        .then(function(foundList){
            if(foundList){
                //console.log("Already has the name in the foundList");
                res.render("list", {listTitle : foundList.name, newListItems: foundList.items})
            }
            else{
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            }
        })
        .catch(function(err){
            console.log(err + ": Err in finding name in foundList");
        });    
}); 


app.listen(3000, function(){
    console.log("Server running at port 3000");
});



