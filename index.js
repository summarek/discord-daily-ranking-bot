const express = require("express");
const app = express();
const Discord = require("discord.js");
const client = new Discord.Client();

require("dotenv").config();
Author = [];
app.listen(3000);

client.on("ready", async () => {
  console.log("CONNECTED AS " + client.user.tag);
  console.log();
  setInterval(async () => {
    let today = new Date();
    if ((today.getHours() == 23 && today.getMinutes() == 59) || true) {
      console.log("idzie");

      var startTime = Date.now();
      var elapsedTime = 0;
      var interval = setInterval(function () {
        elapsedTime = Date.now() - startTime;
      }, 100);
      let messagesCount = Author.map((el) => el.messages).reduce(function (
        previousValue,
        currentValue
      ) {
        return previousValue + currentValue;
      });

      Array.prototype.sortBy = function (p) {
        return this.slice(0).sort(function (a, b) {
          return a[p] > b[p] ? 1 : a[p] < b[p] ? -1 : 0;
        });
      };
      sortedAuthors = Author.sortBy("messages").reverse();
      console.log(sortedAuthors);
      let discordMessage = `
            __***Ranking tryhardów***__

      Podczas dzisiejszego dnia zostało wysłanych **${Math.ceil(
        messagesCount
      )}** wiadomości

      __***Pobieranie wiadomości zajęło***__
      :alarm_clock: **${(elapsedTime / 1000).toFixed(2)}** sekund

      __***Najlepsze tryhardy***__
      :first_place: **${sortedAuthors[0].authorNick}** - ${Math.ceil(
        sortedAuthors[0].messages
      )} wiadomości czyli **${(
        (Math.ceil(sortedAuthors[0].messages) / messagesCount) *
        100
      ).toFixed(2)}% wszystkich wiadomości!**
      :second_place: **${sortedAuthors[1].authorNick}** - ${Math.ceil(
        sortedAuthors[1].messages
      )} wiadomości czyli **${(
        (Math.ceil(sortedAuthors[1].messages) / messagesCount) *
        100
      ).toFixed(2)}% wszystkich wiadomości!**
      :third_place: **${sortedAuthors[2].authorNick}** - ${Math.ceil(
        sortedAuthors[2].messages
      )} wiadomości czyli **${(
        (Math.ceil(sortedAuthors[2].messages) / messagesCount) *
        100
      ).toFixed(2)}% wszystkich wiadomości!**
      :military_medal: **${sortedAuthors[3].authorNick}** - ${Math.ceil(
        sortedAuthors[3].messages
      )} wiadomości czyli **${(
        (Math.ceil(sortedAuthors[3].messages) / messagesCount) *
        100
      ).toFixed(2)}% wszystkich wiadomości!**
      :medal: **${sortedAuthors[4].authorNick}** - ${Math.ceil(
        sortedAuthors[4].messages
      )} wiadomości czyli **${(
        (Math.ceil(sortedAuthors[4].messages) / messagesCount) *
        100
      ).toFixed(2)}% wszystkich wiadomości!**`;

      client.channels.cache.get(`696493487121760331`).send(discordMessage);

      clearInterval(interval);
    }
  }, 5 * 1000);

  client.on("message", async (message) => {
    if (Author.some((e) => e.authorNicknameId == message.author.id)) {
      Author.find(
        (e) => (e.authorNicknameId = message.author.id)
      ).messages += 1;
    } else {
      Author.push({
        authorNicknameId: message.author.id,
        authorNick: message.author.username,
        messages: 1,
      });
    }
  });
});

client.login(process.env.DISCORD_TOKEN);
