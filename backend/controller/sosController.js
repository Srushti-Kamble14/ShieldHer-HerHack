import client from "../config/twilio.js";
import Profile from "../models/profile.js";

// const formatNumber = (num) => {
//     if (!num) return null;

//     // Remove all non-digit characters EXCEPT leading +
//     let raw = String(num).trim();

//     // Already in E.164 format: +91XXXXXXXXXX
//     if (raw.startsWith("+")) {
//         const digits = raw.replace(/\D/g, "");
//         if (digits.length >= 10) return "+" + digits;
//         return null;
//     }

//     // Strip all non-digits
//     let n = raw.replace(/\D/g, "");

//     if (n.length === 10) return "+91" + n;                          // 9876543210
//     if (n.length === 11 && n.startsWith("0")) return "+91" + n.slice(1); // 09876543210
//     if (n.length === 12 && n.startsWith("91")) return "+" + n;     // 919876543210
//     if (n.length === 13 && n.startsWith("091")) return "+" + n.slice(1); // 0919876543210

//     return null;
// };
const formatNumber = (num) => {
  if (!num) return null;

  let n = String(num).replace(/\D/g, "");

  if (n.length === 10) return "+91" + n;
  if (n.length === 12 && n.startsWith("91")) return "+" + n;

  return null;
};
export const sendSOS = async (req, res) => {
  const { userId, lat, lng } = req.body;

  console.log("=== SOS TRIGGERED ===");
  console.log("userId:", userId, "lat:", lat, "lng:", lng);

  if (!userId || !lat || !lng) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  if (!process.env.TWILIO_NUMBER) {
    return res.status(500).json({ msg: "TWILIO number missing in .env" });
  }

  const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

  try {
    const user = await Profile.findOne({ userId });

    if (!user) return res.status(404).json({ msg: "Profile not found" });
    if (!user.emergencyContacts?.length)
      return res.status(404).json({ msg: "No emergency contacts found" });

    const senderName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      "User";

    console.log("Sender:", senderName);
    console.log(
      "Raw contacts from DB:",
      JSON.stringify(user.emergencyContacts),
    );

    const results = await Promise.allSettled(
      user.emergencyContacts.map(async (contact) => {
        const rawPhone = contact.phone;
        const number = formatNumber(rawPhone);

        console.log(
          `Contact: ${contact.name} | Raw: ${rawPhone} | Formatted: ${number}`,
        );

        if (!number)
          throw new Error(`Invalid number for ${contact.name}: "${rawPhone}"`);

        // await client.messages.create({
        //     from: process.env.TWILIO_NUMBER,
        //     to: number,
        //     body:
        //         `🚨 EMERGENCY ALERT 🚨\n\n` +
        //         `${senderName} is in danger.\n\n` +
        //         `She needs your help urgently!\n\n` +
        //         `📍 Please check the location here:\n${locationLink}`,
        // });

        // await client.calls.create({
        //     from: process.env.TWILIO_NUMBER,
        //     to: number,
        //     twiml: `<Response><Say voice="alice">Hello, This is an emergency call. ${senderName} is in danger and needs your help immediately. Her live location has been sent to your phone. Please respond as soon as possible.</Say></Response>`,
        // });

        // 📩 SMS
        try {
          await client.messages.create({
            from: process.env.TWILIO_NUMBER,
            to: number,
            // body:
            // `🚨 EMERGENCY ALERT 🚨\n\n` +
            // `${senderName} is in danger.\n\n` +
            // `She needs your help urgently!\n\n` +
            // `📍 Please check the location here:\n${locationLink}`,
            body: `Hi, ${senderName} share her location . Please check  ${locationLink}`,
          });
          console.log("✅ SMS sent to", number);
        } catch (err) {
          console.error("❌ SMS failed:", err.message);
        }

        // 📞 CALL (always try)
        try {
          await client.calls.create({
            from: process.env.TWILIO_NUMBER,
            to: number,
            twiml: `<Response><Say voice="alice">Hello, This is an emergency call. ${senderName} is in danger and needs your help immediately. Her live location has been sent to your phone. Please respond as soon as possible.</Say></Response>`,
          });
          console.log("✅ Call sent to", number);
        } catch (err) {
          console.error("❌ Call failed:", err.message);
        }

        console.log(`✅ SOS sent to ${contact.name} (${number})`);
        return {
          name: contact.name,
          phone: contact.phone,
          relation: contact.relation,
        };
      }),
    );

    const success = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason?.message || "Unknown error");

    console.log("✅ Success:", success.length, "❌ Failed:", failed.length);
    if (failed.length > 0) console.log("Failed reasons:", failed);

    return res.json({
      msg: `SOS sent to ${success.length} contacts`,
      contacts: success,
      success,
      failed: failed.length,
      failedReasons: failed,
    });
  } catch (err) {
    console.error("SOS ERROR:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// // --trial code


// import client from "../config/twilio.js";
// import Profile from "../models/Profile.js";

// export const sendSOS = async (req, res) => {
//     const { userId, lat, lng } = req.body;

//     console.log("=== SOS TRIGGERED ===");
//     console.log("userId:", userId, "lat:", lat, "lng:", lng);

//     if (!userId || !lat || !lng) {
//         return res.status(400).json({ msg: "Missing required fields" });
//     }

//     if (!process.env.TWILIO_NUMBER) {
//         return res.status(500).json({ msg: "TWILIO number missing in .env" });
//     }

//     const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

//     try {
//         const user = await Profile.findOne({ userId });

//         if (!user) return res.status(404).json({ msg: "Profile not found" });

//         const senderName =
//             [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "User";

//         console.log("Sender:", senderName);

//         // 🔥 TEST MODE — only your number
//         const testNumber = "+917709732738"; // 👈 apna number yaha daal

//         const results = await Promise.allSettled(
//             [{ name: "Me", phone: testNumber }].map(async () => {

//                 const number = testNumber;

//                 console.log("📲 Testing SMS to:", number);

//                 // 📩 SMS
//                 try {
//                     await client.messages.create({
//                         from: process.env.TWILIO_NUMBER,
//                         to: number,
//                         body: `Test message: ${locationLink}`,
//                     });
//                     console.log("✅ SMS sent to", number);
//                 } catch (err) {
//                     console.error("❌ SMS failed:", err.message);
//                 }

//                 // 📞 CALL
//                 try {
//                     await client.calls.create({
//                         from: process.env.TWILIO_NUMBER,
//                         to: number,
//                         twiml: `<Response><Say>Test call working</Say></Response>`,
//                     });
//                     console.log("✅ Call sent to", number);
//                 } catch (err) {
//                     console.error("❌ Call failed:", err.message);
//                 }

//                 return { name: "Me", phone: number };
//             })
//         );

//         const success = results
//             .filter(r => r.status === "fulfilled")
//             .map(r => r.value);

//         const failed = results
//             .filter(r => r.status === "rejected")
//             .map(r => r.reason?.message || "Unknown error");

//         console.log("✅ Success:", success.length, "❌ Failed:", failed.length);

//         return res.json({
//             msg: `Test SOS sent`,
//             contacts: success,
//             success,
//             failed: failed.length,
//             failedReasons: failed,
//         });

//     } catch (err) {
//         console.error("SOS ERROR:", err);
//         return res.status(500).json({ msg: "Server error", error: err.message });
//     }
// };