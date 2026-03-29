const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:3000";

const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME || "@athenamdtechub";
const GROUP_USERNAME = process.env.GROUP_USERNAME || "@athenamdtechgroup";

const CHANNEL_LINK = process.env.CHANNEL_LINK || "https://t.me/athenamdtechub";
const GROUP_LINK = process.env.GROUP_LINK || "https://t.me/athenamdtechgroup";
const WHATSAPP_CHANNEL_LINK =
  process.env.WHATSAPP_CHANNEL_LINK ||
  "https://whatsapp.com/channel/0029Vb7sl8d72WTqwvf0U53C";

const startTime = Date.now();

function menuText(user) {
  const username = user.username ? `@${user.username}` : "No username";

  return `▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬

┃┌─〔 ʙᴏᴛ ɪɴғᴏ 〕
┃ ➩ ʙᴏᴛ ɴᴀᴍᴇ: ᴀᴛʜᴇɴᴀ ᴍᴅ
┃ ➩ ᴜsᴇʀɴᴀᴍᴇ : ${username}
┃ ➩ ᴜsᴇʀID : ${user.id}
┃└────────────

┃┌─〔 ᴀᴛʜᴇɴᴀ ᴍᴅ ᴄᴏᴍᴍᴀɴᴅꜱ 〕
┃ ➩ /pair <ɴᴜᴍʙᴇʀ>
┃ ➩ /delpair
┃ ➩ /runtime
┃ ➩ /help
┃└────────────

▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬`;
}

function helpText() {
  return `⚄︎═══════════════════⚄︎
┃┌─〔 ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ 〕
┃
┃ ➩ /pair <ɴᴜᴍʙᴇʀ>
┃   • ᴘᴀɪʀ ʏᴏᴜʀ ᴅᴇᴠɪᴄᴇ
┃
┃ ➩ /delpair
┃   • ʀᴇᴍᴏᴠᴇ ᴘᴀɪʀɪɴɢ
┃
┃ ➩ /runtime
┃   • ᴄʜᴇᴄᴋ ʀᴇsᴘᴏɴsᴇ
┃
┃ ➩ /help
┃   • sʜᴏᴡ ᴛʜɪs ᴍᴇɴᴜ
┃└────────────
⚄︎═══════════════════⚄︎`;
}

function authCompleteText() {
  return `▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
┃ ᴀᴜᴛʜᴏʀɪᴢᴀᴛɪᴏɴ ᴄᴏᴍᴘʟᴇᴛᴇ
┃ ɢʀᴏᴜᴘ ᴊᴏɪɴᴇᴅ
┃ ᴄʜᴀɴɴᴇʟ ᴊᴏɪɴᴇᴅ
┃ ᴄʟɪᴄᴋ ᴏɴ sᴛᴀʀᴛ ʙᴏᴛ ᴛᴏ ʙᴇɢɪɴ
▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬`;
}

function joinText() {
  return `⚠️ You must join our channel and group before using this bot.

After joining both, tap:
ɪ ʜᴀᴠᴇ ᴊᴏɪɴᴇᴅ ✅`;
}

function joinButtons() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "ᴊᴏɪɴ ᴄʜᴀɴɴᴇʟ", url: CHANNEL_LINK }],
        [{ text: "ᴊᴏɪɴ ɢʀᴏᴜᴘ", url: GROUP_LINK }],
        [{ text: "ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ", url: WHATSAPP_CHANNEL_LINK }],
        [{ text: "ɪ ʜᴀᴠᴇ ᴊᴏɪɴᴇᴅ ✅", callback_data: "check_join" }]
      ]
    }
  };
}

function authButtons() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "sᴛᴀʀᴛ ʙᴏᴛ", callback_data: "start_bot" }],
        [{ text: "ʜᴇʟᴘ", callback_data: "help_menu" }],
        [{ text: "ʀᴜɴᴛɪᴍᴇ", callback_data: "runtime_menu" }],
        [
          { text: "ᴄʜᴀɴɴᴇʟ", url: CHANNEL_LINK },
          { text: "ɢʀᴏᴜᴘ", url: GROUP_LINK }
        ],
        [{ text: "ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ", url: WHATSAPP_CHANNEL_LINK }]
      ]
    }
  };
}

function quickButtons() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "sᴛᴀʀᴛ ʙᴏᴛ", callback_data: "start_bot" }],
        [{ text: "ʜᴇʟᴘ", callback_data: "help_menu" }],
        [{ text: "ʀᴜɴᴛɪᴍᴇ", callback_data: "runtime_menu" }],
        [
          { text: "ᴄʜᴀɴɴᴇʟ", url: CHANNEL_LINK },
          { text: "ɢʀᴏᴜᴘ", url: GROUP_LINK }
        ],
        [{ text: "ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ", url: WHATSAPP_CHANNEL_LINK }]
      ]
    }
  };
}

function getRuntimeText() {
  const uptimeMs = Date.now() - startTime;
  const seconds = Math.floor((uptimeMs / 1000) % 60);
  const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
  const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

  return `⚄︎═══════════════════⚄︎
┃┌─〔 ʀᴜɴᴛɪᴍᴇ ɪɴғᴏ 〕
┃
┃ ➩ ᴜᴘᴛɪᴍᴇ : ${days}d ${hours}h ${minutes}m ${seconds}s
┃ ➩ sᴛᴀᴛᴜs : ᴀᴄᴛɪᴠᴇ
┃└────────────
⚄︎═══════════════════⚄︎`;
}

async function checkMembership(bot, userId) {
  try {
    const [channelMember, groupMember] = await Promise.all([
      bot.getChatMember(CHANNEL_USERNAME, userId),
      bot.getChatMember(GROUP_USERNAME, userId)
    ]);

    const allowed = ["creator", "administrator", "member", "restricted"];

    return (
      allowed.includes(channelMember.status) &&
      allowed.includes(groupMember.status)
    );
  } catch (e) {
    return false;
  }
}

async function enforceJoin(bot, msg) {
  const joined = await checkMembership(bot, msg.from.id);

  if (joined) return true;

  await bot.sendMessage(msg.chat.id, joinText(), joinButtons());
  return false;
}

function normalizePhoneNumber(input) {
  let phoneNumber = String(input || "").replace(/[^\d]/g, "");

  if (phoneNumber.startsWith("0")) {
    phoneNumber = "234" + phoneNumber.slice(1);
  }

  phoneNumber = phoneNumber.replace(/^\+/, "");

  return phoneNumber;
}

function startTelegramBot() {
  if (!TOKEN) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN in .env");
  }

  const bot = new TelegramBot(TOKEN, {
    polling: {
      autoStart: true,
      interval: 1000,
      params: {
        timeout: 10
      }
    }
  });

  let restartingPolling = false;
  let lastRestartAt = 0;

  bot.on("polling_error", async (err) => {
    console.log("⚠️ Polling error:", err.message);

    if (restartingPolling) return;

    const now = Date.now();
    if (now - lastRestartAt < 4000) {
      console.log("⏳ Skipping restart because one just happened");
      return;
    }

    restartingPolling = true;
    lastRestartAt = now;

    try {
      await bot.stopPolling();
      console.log("🛑 Polling stopped");
    } catch (e) {
      console.log("Stop polling error:", e.message);
    }

    setTimeout(async () => {
      try {
        await bot.startPolling();
        console.log("✅ Telegram polling restarted");
      } catch (e) {
        console.log("❌ Restart polling failed:", e.message);
      } finally {
        restartingPolling = false;
      }
    }, 5000);
  });

  bot.on("error", (err) => {
    console.log("TELEGRAM ERROR:", err.message);
  });

  bot.onText(/^\/start$/i, async (msg) => {
    const allowed = await enforceJoin(bot, msg);
    if (!allowed) return;

    await bot.sendMessage(msg.chat.id, authCompleteText(), authButtons());
  });

  bot.onText(/^\/help$/i, async (msg) => {
    const allowed = await enforceJoin(bot, msg);
    if (!allowed) return;

    await bot.sendMessage(msg.chat.id, helpText(), quickButtons());
  });

  bot.onText(/^\/runtime$/i, async (msg) => {
    const allowed = await enforceJoin(bot, msg);
    if (!allowed) return;

    await bot.sendMessage(msg.chat.id, getRuntimeText(), quickButtons());
  });

  bot.onText(/^\/pair(?:\s+(.+))?$/i, async (msg, match) => {
    const allowed = await enforceJoin(bot, msg);
    if (!allowed) return;

    const rawNumber = match && match[1] ? match[1].trim() : "";
    const phoneNumber = normalizePhoneNumber(rawNumber);

    if (!phoneNumber) {
      await bot.sendMessage(
        msg.chat.id,
        `❌ Please add your WhatsApp number.

Example:
/pair 2349035140492
/pair 447900817784`,
        quickButtons()
      );
      return;
    }

    if (!/^\d{10,15}$/.test(phoneNumber)) {
      await bot.sendMessage(
        msg.chat.id,
        `❌ Invalid number format.

Use like this:
/pair 2349035140492
/pair 447900817784`,
        quickButtons()
      );
      return;
    }

    try {
      await bot.sendMessage(
        msg.chat.id,
        "⏳ Generating pairing code...",
        quickButtons()
      );

      const response = await axios.post(`${API_BASE_URL}/pair`, {
        telegramUserId: msg.from.id,
        phoneNumber
      });

      if (!response.data.ok) {
        await bot.sendMessage(
          msg.chat.id,
          `❌ ${response.data.error || "Failed"}`,
          quickButtons()
        );
        return;
      }

      const code = response.data.code;

      await bot.sendMessage(
        msg.chat.id,
        `▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
PAIRING CODE GENERATED SUCCESSFULLY

TARGET: ${phoneNumber}
CODE: ${code}

EXPIRES IN: 5:00
▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        quickButtons()
      );
    } catch (error) {
      const errMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Unknown error";

      await bot.sendMessage(msg.chat.id, `❌ ${errMsg}`, quickButtons());
    }
  });

  bot.onText(/^\/delpair$/i, async (msg) => {
    const allowed = await enforceJoin(bot, msg);
    if (!allowed) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/delete`, {
        telegramUserId: msg.from.id
      });

      if (response.data.ok) {
        await bot.sendMessage(
          msg.chat.id,
          "✅ Your WhatsApp session was deleted.",
          quickButtons()
        );
      } else {
        await bot.sendMessage(
          msg.chat.id,
          "❌ Failed to delete session.",
          quickButtons()
        );
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Unknown error";

      await bot.sendMessage(msg.chat.id, `❌ ${errMsg}`, quickButtons());
    }
  });

  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "check_join") {
      const joined = await checkMembership(bot, query.from.id);

      if (!joined) {
        await bot.answerCallbackQuery(query.id, {
          text: "❌ You still need to join both.",
          show_alert: true
        });
        return;
      }

      await bot.answerCallbackQuery(query.id, {
        text: "✅ Membership confirmed"
      });

      await bot.sendMessage(chatId, authCompleteText(), authButtons());
      return;
    }

    if (query.data === "start_bot") {
      await bot.answerCallbackQuery(query.id, {
        text: "✅ Bot menu opened"
      });

      await bot.sendMessage(chatId, menuText(query.from), quickButtons());
      return;
    }

    if (query.data === "help_menu") {
      await bot.answerCallbackQuery(query.id, {
        text: "📖 Help opened"
      });

      await bot.sendMessage(chatId, helpText(), quickButtons());
      return;
    }

    if (query.data === "runtime_menu") {
      await bot.answerCallbackQuery(query.id, {
        text: "⏱️ Runtime opened"
      });

      await bot.sendMessage(chatId, getRuntimeText(), quickButtons());
      return;
    }
  });

  bot.on("message", async (msg) => {
    if (!msg.text) return;
    if (msg.text.startsWith("/")) return;

    const allowed = await enforceJoin(bot, msg);
    if (!allowed) return;

    await bot.sendMessage(
      msg.chat.id,
      `❌ Unknown message.

Use:
/pair 234xxxxxxxxxx
/help
/runtime`,
      quickButtons()
    );
  });

  process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION:", err.message);
  });

  process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION:", err);
  });

  console.log("🤖 Telegram bot started");
}

module.exports = { startTelegramBot };