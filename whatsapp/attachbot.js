import fs from "fs";
import PhoneNumber from "awesome-phonenumber";
import { jidDecode, jidNormalizedUser } from "@whiskeysockets/baileys";
import { handleMessages, handleGroupParticipantUpdate, handleStatus } from "../main.js";
import { smsg } from "../lib/myfunc.js";
import settings from "../settings.js";
import store from "../lib/lightweight_store.js";

export function attachBotHandlers(sock) {
  store.readFromFile();
  setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000);

  store.bind(sock.ev);

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    }
    return jid;
  };

  sock.getName = (jid, withoutContact = false) => {
    const id = sock.decodeJid(jid);
    withoutContact = sock.withoutContact || withoutContact;
    let v;

    if (id.endsWith("@g.us")) {
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = await sock.groupMetadata(id).catch(() => ({}));
        resolve(
          v.name ||
          v.subject ||
          PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international")
        );
      });
    } else {
      v =
        id === "0@s.whatsapp.net"
          ? { id, name: "WhatsApp" }
          : id === sock.decodeJid(sock.user.id)
          ? sock.user
          : store.contacts[id] || {};
    }

    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international")
    );
  };

  sock.public = true;
  sock.serializeM = (m) => smsg(sock, m, store);

  sock.ev.on("contacts.update", (update) => {
    for (const contact of update) {
      const id = sock.decodeJid(contact.id);
      if (store && store.contacts) {
        store.contacts[id] = { id, name: contact.notify };
      }
    }
  });

  sock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      const mek = chatUpdate.messages?.[0];
      if (!mek || !mek.message) return;

      mek.message =
        Object.keys(mek.message)[0] === "ephemeralMessage"
          ? mek.message.ephemeralMessage.message
          : mek.message;

      if (mek.key && mek.key.remoteJid === "status@broadcast") {
        await handleStatus(sock, chatUpdate);
        return;
      }

      if (mek.key?.id?.startsWith("BAE5") && mek.key.id.length === 16) return;

      await handleMessages(sock, chatUpdate, true);
    } catch (err) {
      console.error("attachBotHandlers messages.upsert error:", err);
    }
  });

  sock.ev.on("group-participants.update", async (update) => {
    try {
      await handleGroupParticipantUpdate(sock, update);
    } catch (err) {
      console.error("group-participants.update error:", err);
    }
  });

  sock.ev.on("status.update", async (status) => {
    try {
      await handleStatus(sock, status);
    } catch (err) {
      console.error("status.update error:", err);
    }
  });

  sock.ev.on("messages.reaction", async (status) => {
    try {
      await handleStatus(sock, status);
    } catch (err) {
      console.error("messages.reaction error:", err);
    }
  });
}