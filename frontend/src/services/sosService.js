

export const triggerSOS = async (lat, lng) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Token not found");
    throw new Error("Not authenticated");
  }

  // Decode token to get user info
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;
  const API_URL = import.meta.env.VITE_API_URL;

  console.log("Triggering SOS for userId:", userId, "at", lat, lng);
  const res = await fetch("https://shieldher-backend-1h8b.onrender.com/api/sos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      name: payload.name || "User",
      lat,  
      lng,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || "SOS request failed");
  }

  return await res.json();
};