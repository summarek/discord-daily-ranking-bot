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
app.listen(3005);

const updateAuthorsCollection = async (todayDay, todayMonth, todayYear) => {
  await Msg.find({}, async function (err, doc) {
    authors = await doc;
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
    await Msg.countDocuments(
      { messageAuthorId: id, day: todayDay },
      async function (err, allMessages) {
        tempDaily = await allMessages;
      }
    );
    await Msg.countDocuments(
      { messageAuthorId: id, month: todayMonth },
      async function (err, allMessages) {
        tempMonthly = await allMessages;
      }
    );
    await Msg.countDocuments(
      { messageAuthorId: id, year: 2020 },
      async function (err, allMessages) {

        tempYearly = await allMessages;
      }
    );
    if (
      nickname != null &&
      tempDaily != null &&
      tempMonthly != null &&
      tempYearly != null
    ) {
      await Author.updateOne(
        { authorNicknameId: id },
        {
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
    }
  });
};

client.on("ready", async () => {
  console.log("CONNECTED AS " + client.user.tag);
  setInterval(async () => {
    let today = new Date();
    let todayDay = new Date().getDate();
    let todayMonth = new Date().getMonth() + 1;
    let todayYear = 2020;
    let messagesCount;



    if (today.getHours() == 0 && today.getMinutes() == 1) {
	    console.log("idzie!")
      var startTime = Date.now();
      var elapsedTime = 0;
      var interval = setInterval(function () {
        elapsedTime = Date.now() - startTime;
      }, 100);

      await updateAuthorsCollection(todayDay - 1, todayMonth, 2020);
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

	//client.channels.cache.get(`696493487121760331`).send(discordMessage);
          client.channels.cache.get(`710585120637321246`).send(discordMessage);
        });

      clearInterval(interval);
    } else {
    	await updateAuthorsCollection(todayDay, todayMonth, 2020);
    }
  }, 50 * 1000);
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

    });
  });

});

client.login(process.env.DISCORD_TOKEN);
