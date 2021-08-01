const express = require("express");
const server = new express();
const port = process.env.PORT || 3333;
const fs = require('fs');
const path = require("path");
const mongoose = require('mongoose');
const node_cron = require('node-cron');
mongo_uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/x';
mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const Botdata = mongoose.model('botlist', {
    ownernumber: {
        type: String,
    },
    botnumber: {
        type: String,
    },
    bot_url: {
        type: String,
    }
})
const abuse = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./abuse.json"))
);
const cron = require('node-cron');

//console.clear();

node_cron.schedule('0 0 * * *',  ()=> {
    Botdata.find({}).exec(function (err, botdata) {
        if (err) {
            console.log(err);
        } else {
            botdata.forEach(currentItem => {
                axios.get(currentItem.bot_url + '/resetdailycount').then(function (response) {
                    console.log(response.data);
                }
                ).catch(function (error) {
                    console.log(error);
                })
            });
        }
    });
});

          

server.listen(port, () => {
   
    console.log("\nRunnning on http://localhost:" + port);
});


server.use(
    express.urlencoded({
        extended: true,
    }),
    express.json()
);

server.use(express.json())
server.get("/", (req, res) => {
    console.log("/");
    res.send("XXX-Bot server");
});


server.get("/allabuse", async (req, res) => {
    console.log("sent");
    res.status(200).send(JSON.stringify(abuse));
});


server.get("/isabuse/:id", async (req, res) => {
    word_array = req.params.id.replace(/[^a-z]/gmi, " ").replace(/\s+/g, " ").split(" ")
    abuse_array = abuse.words.filter(e => word_array.indexOf(e) !== -1)
    if (abuse_array.length > 0) {
        res.status(201).send({ "isabuse": true, "original_sentence": word_array, "words_found": abuse_array});
    }
    else {
        res.status(201).send({ "isabuse": false, "original_sentence": word_array,  "words_found": abuse_array });
    }
});


server.post("/register_new_bot", async (req, res) => {
    console.log("register-new-bot");
    console.log(req.body);
    const mongo = new Botdata(req.body)
    mongo.save().then(() => {
        res.status(201).send("OK");
    }).catch(e => {
        res.status(500).send(e);
    }
    );
})

server.post("/is_registered", async (req, res) => {
    console.log("is_registered");
    Botdata.find({ 'bot_url': req.body.bot_url }).then((result) => {
        console.log('find result-', result.length);
        result.length ?  res.send(true): res.send(false);
    }
    ).catch(e => {
        console.log('find error', e);
    }
    );
})

process.on('uncaughtException', err => console.log(err));