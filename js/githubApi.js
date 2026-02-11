import { CONFIG } from "./config.js";

const BASE_URL = `https://api.github.com/repos/${CONFIG.OWNER}/${CONFIG.REPO}/contents/${CONFIG.FILE_PATH}`;

/**
 * Encode JSON safely to Base64
 */
function encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decode Base64 safely
 */
function decode(str) {
  return decodeURIComponent(escape(atob(str)));
}

/**
 * Fetch complete parking JSON data
 */
export async function getData() {
  const res = await fetch(BASE_URL, {
    headers: {
      Authorization: `token ${CONFIG.TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub fetch failed: ${res.status}`);
  }

  const data = await res.json();

  if (!data.content) {
    throw new Error("Invalid GitHub response");
  }

  return {
    json: JSON.parse(decode(data.content)),
    sha: data.sha,
  };
}

/**
 * Get all vehicles (with history)
 */
export async function getAllVehicles() {
  const { json } = await getData();
  return json.vehicles;
}

/**
 * Get vehicle by vehicle number
 */
export async function getVehicleByNumber(vehicleNumber) {
  const { json } = await getData();

  return (
    json.vehicles.find(
      (v) => v.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase(),
    ) || null
  );
}

/**
 * Get vehicle by mobile number
 */
export async function getVehicleByMobile(mobileNumber) {
  const { json } = await getData();

  return json.vehicles.find((v) => v.mobileNumber === mobileNumber) || null;
}

/**
 * Get parked vehicles only
 */
export async function getParkedVehicles() {
  const { json } = await getData();

  return json.vehicles.filter((v) => v.status === "IN");
}

/*export async function saveData(updated, sha) {
  const encoded = encode(JSON.stringify(updated, null, 2));

  await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      Authorization: `token ${CONFIG.TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Parking update",
      content: encoded,
      sha,
    }),
  });
}*/
