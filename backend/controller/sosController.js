import client from "../config/twilio.js";
import Profile from "../models/profile.js";
import { randomUUID } from "node:crypto";

const LIVE_SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const LIVE_UPDATE_MIN_INTERVAL_MS = 60 * 1000;
const LIVE_UPDATE_MIN_DISTANCE_METERS = 50;
const activeSosSessions = new Map();

const hasOnlyKeys = (value, allowedKeys) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).every((key) => allowedKeys.includes(key));

const hasValidCoordinates = ({ lat, lng }) =>
  typeof lat === "number" &&
  Number.isFinite(lat) &&
  lat >= -90 &&
  lat <= 90 &&
  typeof lng === "number" &&
  Number.isFinite(lng) &&
  lng >= -180 &&
  lng <= 180;

const distanceInMeters = (first, second) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(second.lat - first.lat);
  const longitudeDelta = radians(second.lng - first.lng);
  const firstLatitude = radians(first.lat);
  const secondLatitude = radians(second.lat);
  const haversine = Math.min(1,
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2,
  );

  return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const removeExpiredSessions = (sessions, currentTime, preserveUserId) => {
  for (const [userId, session] of sessions) {
    if (userId !== preserveUserId && session.expiresAt <= currentTime) {
      sessions.delete(userId);
    }
  }
};

const sessionExpiryCleanup = setInterval(
  () => removeExpiredSessions(activeSosSessions, Date.now()),
  60 * 1000,
);
sessionExpiryCleanup.unref();

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
  const { lat, lng } = req.body || {};
  const userId = req.user.id;

  if (
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    typeof lng !== "number" ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return res
      .status(400)
      .json({ msg: "Valid latitude and longitude are required" });
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

    const results = await Promise.allSettled(
      user.emergencyContacts.map(async (contact) => {
        const rawPhone = contact.phone;
        const number = formatNumber(rawPhone);

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

        const communicationErrors = [];
        let communicationSucceeded = false;

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
          communicationSucceeded = true;
        } catch (err) {
          communicationErrors.push(err.message || "SMS failed");
        }

        try {
          await client.calls.create({
            from: process.env.TWILIO_NUMBER,
            to: number,
            twiml: `<Response><Say voice="alice">Hello, This is an emergency call. ${senderName} is in danger and needs your help immediately. Her live location has been sent to your phone. Please respond as soon as possible.</Say></Response>`,
          });
          communicationSucceeded = true;
        } catch (err) {
          communicationErrors.push(err.message || "Call failed");
        }

        if (!communicationSucceeded) {
          throw new Error(communicationErrors.join("; "));
        }

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

    removeExpiredSessions(activeSosSessions, Date.now());
    let sharingSessionId;
    if (success.length > 0) {
      sharingSessionId = randomUUID();
      activeSosSessions.set(String(userId), {
        sharingSessionId,
        expiresAt: Date.now() + LIVE_SESSION_TTL_MS,
        active: false,
        lastSentLocation: null,
        lastSentAt: null,
        updating: false,
        pendingUpdate: null,
      });
    }

    return res.json({
      msg: `SOS sent to ${success.length} contacts`,
      contacts: success,
      success,
      failed: failed.length,
      failedReasons: failed,
      ...(sharingSessionId ? { sharingSessionId } : {}),
    });
  } catch (err) {
    console.error("[SOS] Initial notification failed.");
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const createLiveSharingHandlers = ({
  sessions = activeSosSessions,
  profileModel = Profile,
  smsClient = client,
  now = Date.now,
} = {}) => {
  // Sessions are memory-only and single-instance; only the latest accepted fix is
  // retained in RAM for throttling, never written to a database or location history.
  // Multi-instance deployments need shared ephemeral session state.
  const getSession = (userId, sharingSessionId) => {
    const key = String(userId);
    const session = sessions.get(key);
    if (!session || session.sharingSessionId !== sharingSessionId) {
      return { error: "SOS sharing session not found", status: 404 };
    }
    if (session.expiresAt <= now()) {
      sessions.delete(key);
      return { error: "SOS sharing session has expired", status: 410 };
    }
    return { key, session };
  };

  const startLiveSharing = (req, res) => {
    const { sessionId } = req.body || {};
    if (
      !hasOnlyKeys(req.body, ["sessionId"]) ||
      typeof sessionId !== "string" ||
      !sessionId
    ) {
      return res.status(400).json({ msg: "A valid sessionId is required" });
    }

    removeExpiredSessions(sessions, now(), String(req.user.id));
    const result = getSession(req.user.id, sessionId);
    if (result.error) {
      return res.status(result.status).json({ msg: result.error });
    }

    result.session.active = true;
    return res.json({
      msg: "Live location sharing is ready",
      expiresAt: new Date(result.session.expiresAt).toISOString(),
      expiresInMs: Math.max(0, result.session.expiresAt - now()),
    });
  };

  const updateLiveLocation = async (req, res) => {
    const { sessionId, lat, lng } = req.body || {};
    if (
      !hasOnlyKeys(req.body, ["sessionId", "lat", "lng"]) ||
      typeof sessionId !== "string" ||
      !sessionId ||
      !hasValidCoordinates({ lat, lng })
    ) {
      return res
        .status(400)
        .json({ msg: "A valid sessionId, latitude, and longitude are required" });
    }

    removeExpiredSessions(sessions, now(), String(req.user.id));
    const result = getSession(req.user.id, sessionId);
    if (result.error) {
      return res.status(result.status).json({ msg: result.error });
    }
    if (!result.session.active) {
      return res.status(409).json({ msg: "Live sharing has not been started" });
    }
    if (result.session.updating) {
      return res.json({ sent: false, msg: "A location update is already in progress" });
    }

    const currentLocation = { lat, lng };
    if (result.session.lastSentLocation) {
      const elapsed = now() - result.session.lastSentAt;
      const distance = distanceInMeters(
        result.session.lastSentLocation,
        currentLocation,
      );
      if (
        elapsed < LIVE_UPDATE_MIN_INTERVAL_MS ||
        distance < LIVE_UPDATE_MIN_DISTANCE_METERS
      ) {
        return res.json({ sent: false, msg: "Update skipped by sharing limits" });
      }
    }

    result.session.updating = true;
    try {
      const user = await profileModel.findOne({ userId: req.user.id });
      if (!user) return res.status(404).json({ msg: "Profile not found" });
      if (!user.emergencyContacts?.length) {
        return res.status(404).json({ msg: "No emergency contacts found" });
      }

      const senderName =
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        "User";
      const locationLink = `https://maps.google.com/?q=${lat},${lng}`;
      if (
        !result.session.active ||
        sessions.get(result.key) !== result.session ||
        result.session.expiresAt <= now()
      ) {
        return res.status(410).json({ msg: "SOS sharing session has ended" });
      }

      const notifications = Promise.allSettled(
        user.emergencyContacts.map(async (contact) => {
          const number = formatNumber(contact.phone);
          if (!number) throw new Error("Invalid emergency contact number");
          await smsClient.messages.create({
            from: process.env.TWILIO_NUMBER,
            to: number,
            body: `LIVE LOCATION UPDATE: ${senderName} shared an updated location: ${locationLink}`,
          });
        }),
      );
      result.session.pendingUpdate = notifications;
      const results = await notifications;
      const sentCount = results.filter(
        (notification) => notification.status === "fulfilled",
      ).length;
      if (sentCount === 0) {
        return res
          .status(502)
          .json({ msg: "Unable to send a live location update" });
      }

      if (result.session.active && sessions.get(result.key) === result.session) {
        result.session.lastSentLocation = currentLocation;
        result.session.lastSentAt = now();
      }
      return res.json({
        sent: true,
        updatedAt: new Date(now()).toISOString(),
        contactsNotified: sentCount,
      });
    } catch {
      console.error("[SOS] Live location update failed.");
      return res
        .status(500)
        .json({ msg: "Unable to send a live location update" });
    } finally {
      result.session.updating = false;
      result.session.pendingUpdate = null;
    }
  };

  const stopLiveSharing = async (req, res) => {
    const { sessionId } = req.body || {};
    if (
      !hasOnlyKeys(req.body, ["sessionId"]) ||
      typeof sessionId !== "string" ||
      !sessionId
    ) {
      return res.status(400).json({ msg: "A valid sessionId is required" });
    }

    removeExpiredSessions(sessions, now(), String(req.user.id));
    const result = getSession(req.user.id, sessionId);
    if (result.error) {
      return res.status(result.status).json({ msg: result.error });
    }

    result.session.active = false;
    if (result.session.pendingUpdate) {
      await result.session.pendingUpdate;
    }
    sessions.delete(result.key);
    return res.json({ stopped: true, msg: "Live sharing stopped" });
  };

  return { startLiveSharing, updateLiveLocation, stopLiveSharing };
};

const liveSharingHandlers = createLiveSharingHandlers();
export const startLiveSharing = liveSharingHandlers.startLiveSharing;
export const updateLiveLocation = liveSharingHandlers.updateLiveLocation;
export const stopLiveSharing = liveSharingHandlers.stopLiveSharing;


// // --trial code


// import client from "../config/twilio.js";
// import Profile from "../models/Profile.js";

// export const sendSOS = async (req, res) => {
//     const { userId, lat, lng } = req.body;

//     console.log("=== SOS TRIGGERED ===");

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