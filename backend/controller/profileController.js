import Profile from "../models/profile.js"

export const createProfile = async (req, res) => {
  try {
    const { personal = {}, contacts = [], address = {} } = req.body || {};

    if (!personal.firstName || !personal.phone || !address.line1) {
      return res.status(400).json({ msg: "Required fields missing" });
    }


    const emergencyContacts = (contacts || [])
      .map(c => ({
        name: (c.name || "").trim(),
        relation: (c.relation || "").trim(),
        phone: String(c.phone || "").replace(/\D/g, "").slice(-10),
      }))
      .filter(c => c.name && c.phone.length === 10)
      .slice(0, 5);

    console.log("RAW CONTACTS STATE:", JSON.stringify(emergencyContacts));

    contacts.forEach((c, i) => {
      const digits = String(c.phone || "").replace(/\D/g, "");
      console.log(
        `Contact ${i}: name="${c.name}" relation="${c.relation}" phone="${c.phone}" digits="${digits}" len=${digits.length}`
      );
    });

    const profile = await Profile.create({
      userId: req.user.id,

      firstName: personal.firstName,
      lastName: personal.lastName || "N/A",
      age: personal.age,
      dob: personal.dob,
      phone: personal.phone,
      bloodGroup: personal.bloodGroup,
      medicalNote: personal.medicalNotes,

      emergencyContacts,

      address: {
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        radius: address.radius || "500",
      },

      safeZoneRadius: Number(address.radius || 500),
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error("CREATE PROFILE ERROR:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Get profile for the logged-in user

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



// Update profile for the logged-in user
export const updateProfile = async (req, res) => {
  try {
    const { personal = {}, contacts = [], address = {} } = req.body || {};

    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        firstName: personal.firstName,
        lastName: personal.lastName || "N/A",
        age: personal.age,
        dob: personal.dob,
        phone: personal.phone,
        bloodGroup: personal.bloodGroup,
        medicalNote: personal.medicalNotes,

        emergencyContacts: (contacts || [])
          .filter(c => c.name && c.phone && c.relation)
          .slice(0, 5)
          .map(c => ({
            name: c.name,
            relation: c.relation,
            phone: c.phone,
          })),

        address: {
          line1: address.line1,
          line2: address.line2 || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },

        safeZoneRadius: Number(address.radius || 500),
      },
      { returnDocument: "after", runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ msg: error.message });
  }
};