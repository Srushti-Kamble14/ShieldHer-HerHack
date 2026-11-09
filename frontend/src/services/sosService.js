const SOS_API_URL = "http://localhost:5000/api/sos";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const readResponse = async (response, fallbackMessage) => {
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }
  if (!response.ok) {
    const error = new Error(result.msg || fallbackMessage);
    error.status = response.status;
    throw error;
  }
  return result;
};

const postSOS = async (path, body) => {
  const response = await fetch(`${SOS_API_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return readResponse(response, "SOS request failed");
};

export const triggerSOS = async (lat, lng) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const payload = JSON.parse(atob(token.split(".")[1]));
  const response = await fetch(SOS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: payload.name || "User",
      lat,
      lng,
    }),
  });
  return readResponse(response, "SOS request failed");
};

export const startLiveSharing = (sessionId) =>
  postSOS("/live/start", { sessionId });

export const sendLiveLocation = (sessionId, lat, lng) =>
  postSOS("/live/update", { sessionId, lat, lng });

export const stopLiveSharing = (sessionId) =>
  postSOS("/live/stop", { sessionId });
