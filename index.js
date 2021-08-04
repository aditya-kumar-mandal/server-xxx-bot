const express = require("express");
const server = new express();
const port = process.env.PORT || 5000;
const fs = require('fs');
const path = require("path");
const mongoose = require('mongoose');
const axios = require('axios');
const node_cron = require('node-cron');
const abuse = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./abuse.json"))
);
mongo_uri = process.env.MONGO_URI  || 'mongodb://127.0.0.1:27017/x';
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
        unique: true
    }
})



node_cron.schedule('* */24 * * *',  ()=> {
    Botdata.find({}).exec(function (err, botdata) {
        if (err) {
            console.log(err);
        } else {
            botdata.forEach(currentItem => {
                axios.get(currentItem.bot_url + '/resetdailycount').then(function (response) {
                    console.log(currentItem,response.data);
                }
                ).catch(function (error) {
                    console.log(currentItem,"unable to get site");
                })
            });
        }
    });
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
}
);




server.use(
    express.urlencoded({
        extended: true,
    }),
    express.json()
);

server.use(express.json())
server.get("/", (req, res) => {
    console.log("/");
    res.send({ "NAME": "XXX-BOT SERVER", "END-POINTS": ["/allabuse", "/isabuse/sentence", "/register_new_bot", "/is_registered","/all_registered"] });
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
  //  console.log(req.body);
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
       // console.log('find result-', result.length);
        result.length ?  res.send(true): res.send(false);
    }
    ).catch(e => {
        console.log('found error', e);
        res.status(500).send(e);
    }
    );
})







server.get("/all_registered", async (req, res) => {
    console.log("all_registered");
    Botdata.find().then((result) => {
        console.log('found result-', result);
        res.send(result);
    }
    ).catch(e => {
        console.log('find error', e);
    }
    );
})


process.on('uncaughtException', err => console.log(err));