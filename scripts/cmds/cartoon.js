const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "cartoon",
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Turn an image into anime/cartoon style" },
    longDescription: { en: "Send an image URL or reply to an image, the bot will apply anime/cartoon effect using Aryan API." },
    category: "media",
    guide: { en: "{pn} <image URL>\n\nOr reply to an image with {pn}" }
  },

  onStart: async function ({ api, args, event }) {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    let imageUrl = args[0];

    if (!imageUrl && event.messageReply && event.messageReply.attachments.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
    }

    if (!imageUrl) {
      return api.sendMessage("❌ Please provide an image URL or reply to an image.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const apiUrl = `https://aryanapi.up.railway.app/api/airbrush?imageUrl=${encodeURIComponent(imageUrl)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const effectUrl = res.data?.effectUrl;

      if (!effectUrl) {
        return api.sendMessage("❌ Failed to apply anime/cartoon effect.", event.threadID, event.messageID);
      }

      const fileRes = await axios.get(effectUrl, { responseType: "stream" });
      const filename = `animefy_${Date.now()}.jpg`;
      const filepath = path.join(CACHE_DIR, filename);
      const writer = fs.createWriteStream(filepath);

      fileRes.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "✨ Here is your animefied image:",
          attachment: fs.createReadStream(filepath)
        }, event.threadID, () => { 
          try { fs.unlinkSync(filepath); } catch {} 
        }, event.messageID);

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on("error", (err) => {
        console.error("❌ File write error:", err.message);
        api.sendMessage("❌ Error saving the animefied image.", event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("❌ Error while animefying image:", err.message);
      api.sendMessage("❌ Failed to apply anime/cartoon effect.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
