var MongoClient = require("mongodb").MongoClient;

var laby = require(__dirname + "/exmpleLaby.json");
console.log("connecting..");
var url = "mongodb://localhost:27017/maze"
MongoClient.connect(url, function (error, db) {


    db.collection("maze").find().toArray(function (error, users) {
        if (error) {
            console.error(error);
            return;
        }
        console.log(users);
        db.close();
    });

    /*    db.collection("maze").insertOne(laby, function (error, result) {
            console.log(result);
            db.close();
        });*/

});