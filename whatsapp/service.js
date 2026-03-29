const pino = require("pino");
const fs = require("fs");
const path = require("path");

const {
  handleMessages,
  handleGroupParticipantUpdate,
  handleStatus
} = require("../main");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSessionPath(userId) {
  return path.join("sessions", String(userId));
}

// 🔥 Load Baileys properly (ESM fix)
async function getBaileys() {
  const mod = await import("@whiskeysockets/baileys");
  return {
    makeWASocket: mod.default,
    useMultiFileAuthState: mod.useMultiFileAuthState,
    fetchLatestBaileysVersion: mod.fetchLatestBaileysVersion
  };
}

// 🔥 Attach your full bot logic
function attachKnightBotHandlers(sock) {
  sock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      await handleMessages(sock, chatUpdate, true);
    } catch (err) {
      console.log("Handler error:", err.message);
    }
  });

  sock.ev.on("group-participants.update", async (update) => {
    try {
      await handleGroupParticipantUpdate(sock, update);
    } catch (err) {
      console.log("Group handler error:", err.message);
    }
  });

  sock.ev.on("status.update", async (status) => {
    try {
      await handleStatus(sock, status);
    } catch (err) {
      console.log("Status handler error:", err.message);
    }
  });

  sock.ev.on("messages.reaction", async (status) => {
    try {
      await handleStatus(sock, status);
    } catch (err) {
      console.log("Reaction handler error:", err.message);
    }
  });
}

// 🔥 Build socket
async function buildSocket(userId) {
  const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = await getBaileys();

  const sessionPath = getSessionPath(userId);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["Windows", "Chrome", "114.0.5735.198"],
    logger: pino({ level: "silent" }),
    markOnlineOnConnect: true,
    syncFullHistory: false
  });

  sock.ev.on("creds.update", saveCreds);

  attachKnightBotHandlers(sock);

  return sock;
}

// 🔥 CREATE SESSION (FIXED PAIRING)
async function createSession(userId, phoneNumber) {
  const sessionPath = getSessionPath(userId);

  if (fs.existsSync(sessionPath)) {
    // 🧹 delete old session (IMPORTANT FIX)
    fs.rmSync(sessionPath, { recursive: true, force: true });
  }

  fs.mkdirSync(sessionPath, { recursive: true });

  const sock = await buildSocket(userId);

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection) console.log(`UPDATE [${userId}]:`, connection);

    if (connection === "open") {
      console.log(`✅ User ${userId} connected successfully`);
    }

    if (connection === "close") {
      console.log(`🔄 Restarting session for ${userId}...`);
      await sleep(2000);
      await reconnectSession(userId);
    }
  });

  // 🔥 IMPORTANT FIX → wait longer
  await sleep(6000);

  console.log("📱 PAIRING NUMBER:", phoneNumber);

  let code = await sock.requestPairingCode(phoneNumber);

  // 🔥 format nicely
  code = code?.match(/.{1,4}/g)?.join("-") || code;

  console.log("🔑 PAIRING CODE:", code);

  return code;
}

// 🔁 Reconnect
async function reconnectSession(userId) {
  const sessionPath = getSessionPath(userId);

  if (!fs.existsSync(sessionPath)) {
    throw new Error("Session folder not found.");
  }

  const sock = await buildSocket(userId);

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection) console.log(`RECONNECT [${userId}]:`, connection);

    if (connection === "open") {
      console.log(`✅ User ${userId} reconnected successfully`);
    }
  });

  return sock;
}

// 🗑️ Delete session
async function deleteSession(userId) {
  const sessionPath = getSessionPath(userId);

  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
  }

  console.log(`🗑️ Session deleted for ${userId}`);
}

module.exports = {
  createSession,
  reconnectSession,
  deleteSession
};