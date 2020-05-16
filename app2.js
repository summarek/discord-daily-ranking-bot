const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const client = new Discord.Client();

require("dotenv").config();

const url = `mongodb://localhost:27017`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("error", (err) => {
  logError(err);
});

const db = mongoose.connection;
db.once("open", (_) => {
  console.log("Database connected:", url);
});
db.on("error", (err) => {
  console.error("connection error:", err);
});

const authorSchema = mongoose.Schema({
  authorNicknameId: {},
  authorNick: {},
  dailyMessages: { type: Number, default: 0 },
  monthlyMessages: { type: Number, default: 0 },
  yearlyMessages: { type: Number, default: 0 },
});

let Author = mongoose.model("author", authorSchema);

app.listen(3000);

client.on("ready", async () => {
  console.log("CONNECTED AS " + client.user.tag);
  setInterval(async () => {
    let today = new Date();
    if (today.getHours() == 23 && today.getMinutes() == 55) {
      console.log("idzie");

      var startTime = Date.now();
      var elapsedTime = 0;
      var interval = setInterval(function () {
        elapsedTime = Date.now() - startTime;
      }, 100);
      let messagesCount = (await Author.find({}))
        .map((el) => el.dailyMessages)
        .reduce(function (previousValue, currentValue, index, array) {
          return previousValue + currentValue;
        });

      await Author.find({})
        .sort({ dailyMessages: -1 })
        .limit(5)
        .exec(function (err, doc) {
          console.log("doc:" + doc[0]);

          let discordMessage = `
          __***Ranking tryhardów***__

    Podczas dzisiejszego dnia zostało wysłanych **${Math.ceil(
      messagesCount
    )}** wiadomości

    __***Pobieranie wiadomości zajęło***__ 
    :alarm_clock: **${(elapsedTime / 1000).toFixed(2)}** sekund

    __***Najlepsze tryhardy***__
    :first_place: **${doc[0].authorNick}** - ${Math.ceil(
            doc[0].dailyMessages
          )} wiadomości czyli **${(
            (Math.ceil(doc[0].dailyMessages) / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :second_place: **${doc[1].authorNick}** - ${Math.ceil(
            doc[1].dailyMessages
          )} wiadomości czyli **${(
            (Math.ceil(doc[1].dailyMessages) / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :third_place: **${doc[2].authorNick}** - ${Math.ceil(
            doc[2].dailyMessages
          )} wiadomości czyli **${(
            (Math.ceil(doc[2].dailyMessages) / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :military_medal: **${doc[3].authorNick}** - ${Math.ceil(
            doc[3].dailyMessages
          )} wiadomości czyli **${(
            (Math.ceil(doc[3].dailyMessages) / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :medal: **${doc[4].authorNick}** - ${Math.ceil(
            doc[4].dailyMessages
          )} wiadomości czyli **${(
            (Math.ceil(doc[4].dailyMessages) / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**`;

          client.channels.cache.get(`696493487121760331`).send(discordMessage);

          // Author.collection.drop();
        });

      clearInterval(interval);
    }
  }, 5 * 1000);

  client.on("message", async (message) => {
    console.log(message.content);
    await Author.updateOne(
      { authorNicknameId: message.author.id },
      {
        authorNicknameId: message.author.id,
        authorNick: message.author.username,
        $inc: { dailyMessages: 1 / 2 },
      },
      { upsert: true },

      function (err) {
        // console.log(err);
      }
    );
  });
});

client.login(process.env.DISCORD_TOKEN);
