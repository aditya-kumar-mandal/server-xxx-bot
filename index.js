const express = require("express");
const server = new express();
const port = process.env.PORT || 3333;
const fs = require('fs');
const path = require("path");
const abuse = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./abuse.json"))
);
const cron = require('node-cron');

console.clear();



server.listen(port, () => {
    console.clear();
    console.log("\nRunnning on http://localhost:" + port);
});


server.use(
    express.urlencoded({
        extended: true,
    })
);


server.get("/", (req, res) => {
    console.log("/");
    res.send("XXX-Bot server");
});


server.get("/allabuse", async (req, res) => {
    console.log("sent");
    res.status(200).send(JSON.stringify(abuse));
});


server.get("/isabuse/:id", async (req, res) => {
    let re = new RegExp('[^A-Za-z0-9-]/g');
    word_array = req.params.id.replace(re,"  ").replace(/\s+/g, " ").split(" ")
    abuse_array = abuse.words.filter(e => word_array.indexOf(e) !== -1)
    if (abuse_array.length > 0) {
        res.status(201).send({ "isabuse": true, "original_sentence": word_array, "words_found": abuse_array});
    }
    else {
        res.status(201).send({ "isabuse": false, "original_sentence": word_array,  "words_found": abuse_array });
    }
});


server.get("/register_new_bot/:id", async (req, res) => {
    console.log("register-new-bot");
    console.log(req.params.id);
    datainsert({ "Name": req.params.id },"botlist").then(() => {
        res.send("OK");
    }

    )
})

process.on('uncaughtException', err => console.log(err));