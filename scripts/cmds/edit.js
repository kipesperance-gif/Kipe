const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "edit",
        aliases: [],
        version: "1.1",
        author: "Romeo",
        countDown: 30,
        role: 0,
        shortDescription: "Edit or generate an image using Gemini-Edit",
        category: "𝗔𝗜",
        guide: {
            en: "{pn} <text> (reply to image optional)",
        },
    },
    onStart: async function ({ message, event, args, api }) {
        const prompt = args.join(" ");
        if (!prompt) return message.reply("Please provide the text to edit or generate.");

        const apiurl = "https://gemini-edit-omega.vercel.app/edit";
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            
            let params = { prompt };
            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]) {
                params.imgurl = event.messageReply.attachments[0].url;
            }

            
            const res = await axios.get(apiurl, { params });

            if (!res.data || !res.data.images || !res.data.images[0]) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply("❌ Failed to get image.");
            }

           
            const base64Image = res.data.images[0].replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Image, "base64");

         
            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imagePath = path.join(cacheDir, `${Date.now()}.png`);
            fs.writeFileSync(imagePath, imageBuffer);

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            await message.reply({ attachment: fs.createReadStream(imagePath) }, event.threadID, () => {
                fs.unlinkSync(imagePath);
                message.unsend(message.messageID);
            }, event.messageID);

        } catch (error) {
            console.error("❌ API ERROR:", error.response?.data || error.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("Error generating/editing image.");
        }
    }
};
