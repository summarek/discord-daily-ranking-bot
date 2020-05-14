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

const msgSchema = mongoose.Schema({
  messageAuthor: {},
  messageAuthorId: {},
  messageContent: {},
  day: {},
  month: {},
  year: {},
});

const authorSchema = mongoose.Schema({
  authorNicknameId: {},
  authorNick: {},
  dailyMessages: {},
  monthlyMessages: {},
  yearlyMessages: {},
});

let Msg = mongoose.model("msg", msgSchema);
let Author = mongoose.model("author", authorSchema);
let authors = [];
app.listen(3000);

const updateAuthorsCollection = async (todayDay, todayMonth, todayYear) => {
  await Msg.find({}, function (err, doc) {
    authors = doc;
  });

  let authorsUniqueIds = authors.map((author) => author.messageAuthorId);
  authorsUniqueIds = authorsUniqueIds.filter(
    (v, i) => authorsUniqueIds.indexOf(v) === i && v != undefined
  );
  authorsUniqueIds.forEach(async (id) => {});

  authorsUniqueIds.forEach(async (id) => {
    let tempDaily, tempMonthly, tempYearly, nickname;
    allMes = 0;
    await Msg.findOne({ messageAuthorId: id }, function (err, doc) {
      nickname = doc.messageAuthor;
    });
    await Msg.countDocuments({ messageAuthorId: id, day: todayDay }, function (
      err,
      allMessages
    ) {
      tempDaily = allMessages;
    });
    await Msg.countDocuments(
      { messageAuthorId: id, month: todayMonth },
      function (err, allMessages) {
        tempMonthly = allMessages;
      }
    );
    await Msg.countDocuments(
      { messageAuthorId: id, year: todayYear },
      function (err, allMessages) {
        tempYearly = allMessages;
      }
    );

    Author.updateOne(
      { authorNicknameId: id },
      {
        authorNicknameId: id,
        authorNick: nickname,
        dailyMessages: tempDaily,
        monthlyMessages: tempMonthly,
        yearlyMessages: tempYearly,
      },
      { upsert: true },

      function (err) {
        // console.log(err);
      }
    );
  });
};

client.on("ready", async () => {
  console.log("CONNECTED AS " + client.user.tag);
  setInterval(async () => {
    let today = new Date();
    let todayDay = new Date().getDate();
    let todayMonth = new Date().getMonth() + 1;
    let todayYear = new Date().getFullYear();
    let messagesCount;

    if ((today.getMinutes() == 47 && today.getHours() == 20) || true) {
      var startTime = Date.now();
      var elapsedTime = 0;
      var interval = setInterval(function () {
        elapsedTime = Date.now() - startTime;
      }, 100);

      await updateAuthorsCollection(todayDay, todayMonth, 2020);
      await Msg.find({}, function (err, doc) {
        messagesCount = doc.length;
      });
      await Author.find({})
        .sort({ dailyMessages: -1 })
        .limit(5)
        .exec(function (err, doc) {
          let discordMessage = `
          __***Ranking tryhardów***__

    Podczas dzisiejszego dnia zostało wysłanych **${messagesCount}** wiadomości

    __***Pobieranie wiadomości zajęło***__ 
    :alarm_clock: **${(elapsedTime / 1000).toFixed(2)}** sekund

    __***Najlepsze tryhardy***__
    :first_place: **${doc[0].authorNick}** - ${
            doc[0].dailyMessages
          } wiadomości czyli **${(
            (doc[0].dailyMessages / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :second_place: **${doc[1].authorNick}** - ${
            doc[1].dailyMessages
          } wiadomości czyli **${(
            (doc[1].dailyMessages / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :third_place: **${doc[2].authorNick}** - ${
            doc[2].dailyMessages
          } wiadomości czyli **${(
            (doc[2].dailyMessages / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :military_medal: **${doc[3].authorNick}** - ${
            doc[3].dailyMessages
          } wiadomości czyli **${(
            (doc[3].dailyMessages / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**
    :medal: **${doc[4].authorNick}** - ${
            doc[4].dailyMessages
          } wiadomości czyli **${(
            (doc[4].dailyMessages / messagesCount) *
            100
          ).toFixed(2)}% wszystkich wiadomości!**`;

          client.channels.cache.get(`696493487121760331`).send(discordMessage);
        });

      clearInterval(interval);
    }
  }, 2 * 1000);

  client.on("message", async (message) => {
    let newMsg = await new Msg({
      messageAuthor: message.author.username,
      messageAuthorId: message.author.id,
      messageContent: message.content,
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    newMsg.save(function (err) {
      if (err) throw err;

      console.log("SUCCESS");
    });
  });
});

client.login(process.env.DISCORD_TOKEN);
