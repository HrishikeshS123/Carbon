const { Message } = require('discord.js');
const DATABASE = require('../database/coins');
let talkedRecently = [];
module.exports = {
  name: 'messageCreate',
  /**
   *
   * @param {Message} message
   * @returns
   */
  async execute(message) {
    const client = message.client;
    if (!message.author) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.guild.id !== '') return;
    const userId = message.author.id;
    if (talkedRecently.includes(userId)) return;

    addUser(userId);

    let DBUser = await DATABASE.findOne({ userId });
    if (DBUser) {
      DBUser = new DATABASE({
        userId,
        coins: 0
      });
    }

    const randomAmount = Math.ceil(Math.random() * 12) + 13;
    DBUser.coins += randomAmount;
    DBUser.save();
  }
};

const addUser = (userId) => {
  talkedRecently.push(userId);
  setTimeout(() => talkedRecently.filter((u) => u !== userId), 60 * 1000);
};
