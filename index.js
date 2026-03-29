require("dotenv").config();

const { startApiServer } = require("./api/server");
const { startTelegramBot } = require("./telegram/bot");

startApiServer(process.env.PORT || 3000);
startTelegramBot();