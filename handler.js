"use strict";

const readFile = require("util").promisify(require("fs").readFile);

const telegramAxios = require("axios").create({
  baseURL: "https://api.telegram.org/bot" + process.env.TELEGRAM_TOKEN,
  headers: {
    "Content-Type": "application/json",
    post: {
      "Content-Type": "application/json"
    }
  }
});

module.exports.telegram = async (event, context) => {
  console.log("event", event);
  const data = JSON.parse(event.body);
  const { message } = data;

  if (message) {
    if (message.text && message.text === "/start") {
      // TODO Load this only once
      const rules = await readFile("./templates/rules.md", "utf8");

      const res = await sendMessage(message.from, rules);
      return {
        statusCode: res.status
      };
    } else if (message.new_chat_members) {
      // TODO Load this only once
      const welcome = await readFile("./templates/welcome.md", "utf8");

      const allWelcomeMessages = message.new_chat_members.map(user => {
        console.log("Sending welcome message to ", user);
        return sendMessage(user, welcome);
      });
      const allResponses = await Promise.all(allWelcomeMessages);
      return {
        statusCode: allResponses[0].status
      };
    }
  }

  return {
    statusCode: 200
  };

  async function sendMessage(user, text) {
    try {
      return await telegramAxios.post("/sendMessage", {
        chat_id: message.chat.id,
        text: composeMessage(user, text),
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        disable_notification: true
      });
    } catch (err) {
      console.error("Error sending message", err);
      throw new Error(err);
    }
  }
};

const composeMessage = (user, text) =>
  text
    .replace("$first_name", user.first_name)
    .replace("$username", user.username);

module.exports.register = async (event, context) => {
  const webhookUrl =
    process.env.STAGE === "production"
      ? "https://api.volentix.io/vie/telegram"
      : `https://api.volentix.io/vie-${process.env.STAGE}/telegram`;

  // Clear any old webhook; sometimes it can get into a weird state and this clears it
  await telegramAxios.post("/setWebhook", {
    url: ""
  });

  const res = await telegramAxios.post("/setWebhook", {
    url: webhookUrl
  });

  const webhookInfo = (await telegramAxios.get("/getWebhookInfo")).data;

  console.log("Webhook info", webhookInfo);

  return {
    statusCode: res.status
  };
};
