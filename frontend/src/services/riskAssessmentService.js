import { BASE_URL } from "../api/config";

export const assessSafetyRisk = async (context) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please sign in to request a safety assessment.");
  }

  const response = await fetch(`${BASE_URL}/risk-assessment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(context),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "Safety assessment request failed.");
  }

  return data;
};
