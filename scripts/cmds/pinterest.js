const axios = require("axios");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Search Pinterest images" },
    longDescription: { en: "Fetch Pinterest images by query using Aryan API." },
    category: "image",
    guide: { en: "{pn} <query> | <count>\n\nExample:\n{pn} cat | 5" }
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) {
      return api.sendMessage("❌ Please provide a search query.", event.threadID, event.messageID);
    }

    const input = args.join(" ");
    const [query, countInput] = input.split("|").map(x => x.trim());
    const count = countInput ? parseInt(countInput) : 2;

    if (isNaN(count) || count <= 0 || count > 15) {
      return api.sendMessage("❌ Please provide a valid number of images (1-15).", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://aryanapi.up.railway.app/api/pinterestv2?q=${encodeURIComponent(query)}&count=${count}`;
      const { data } = await axios.get(url);

      if (!data.status || !data.result || data.result.length === 0) {
        return api.sendMessage("❌ No images found.", event.threadID, event.messageID);
      }

      const attachments = await Promise.all(
        data.result.map(img => getStreamFromURL(img.directLink))
      );

      api.sendMessage({
        body: `🔎 Query: ${query}\n📷 Images: ${count}`,
        attachment: attachments
      }, event.threadID, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error("❌ Pinterest Error:", err.message);
      api.sendMessage("❌ Failed to fetch Pinterest images.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

async function getStreamFromURL(url) {
  const res = await axios({ url, responseType: "stream" });
  return res.data;
                               }
