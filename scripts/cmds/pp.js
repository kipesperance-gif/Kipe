const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "pp",
    version: "1.0.0",
    author: "ncs pro",
    countDown: 3,
    role: 0,
    shortDescription: "Facebook প্রোফাইল পিকচার দেখাবে 📸",
    longDescription: "যেকোনো ইউজারের ফেসবুক প্রোফাইল পিকচার দেখা যাবে (নিজে, রিপ্লাই বা লিংক থেকে)।",
    category: "media",
    guide: {
      en: "{pn} [reply/@mention/link]"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const cachePath = __dirname + "/cache/profile.png";

    try {
      let uid;

      // ১️⃣ রিপ্লাই করা মেসেজের ইউজারের প্রোফাইল
      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      }

      // ২️⃣ @mention করা ইউজারের প্রোফাইল
      else if (Object.keys(event.mentions || {}).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }

      // ৩️⃣ লিংক দেওয়া থাকলে
      else if (args[0] && args[0].includes(".com/")) {
        const resID = await api.getUID(args[0]);
        uid = resID;
      }

      // ৪️⃣ কিছু না দিলে নিজের প্রোফাইল
      else {
        uid = event.senderID;
      }

      const name = await usersData.getName(uid);

      const imageUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const callback = () => {
        api.sendMessage(
          {
            body: `🌸✨ ${name} এর প্রোফাইল পিকচার 👇`,
            attachment: fs.createReadStream(cachePath)
          },
          event.threadID,
          () => fs.unlinkSync(cachePath),
          event.messageID
        );
      };

      request(encodeURI(imageUrl))
        .pipe(fs.createWriteStream(cachePath))
        .on("close", callback);

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করো ভাই 😭", event.threadID, event.messageID);
    }
  }
};
