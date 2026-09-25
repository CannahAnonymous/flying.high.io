import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const dataFile = process.env.DATA_FILE || join(root, "data", "store.json");
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const seedListings = [
  { id: "maize-iringa", crop: "Maize", localName: "Mahindi", role: "farmer", location: "Iringa", distanceKm: 24, quantity: "2.4 tonnes", priceTshPerKg: 1150, status: "Ready now", description: "Dry grain, bagged and sorted" },
  { id: "rice-morogoro", crop: "Rice", localName: "Mpunga", role: "agent", location: "Morogoro", distanceKm: 41, quantity: "680 bags", priceTshPerKg: 2400, status: "Route forming", description: "Clean, locally milled grain" },
  { id: "cashew-mtwara", crop: "Cashew", localName: "Korosho", role: "farmer", location: "Mtwara", distanceKm: 12, quantity: "420 kg", priceTshPerKg: 3800, status: "New listing", description: "Sun-dried, farm-gate harvest" }
];

async function loadStore() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const store = { listings: seedListings, interests: [] };
    await mkdir(dirname(dataFile), { recursive: true });
    await writeFile(dataFile, JSON.stringify(store, null, 2));
    return store;
  }
}

async function saveStore(store) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}

function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 20_000) throw Object.assign(new Error("Request body is too large"), { status: 413 });
  }
  try { return JSON.parse(raw || "{}"); } catch { throw Object.assign(new Error("Request body must be valid JSON"), { status: 400 }); }
}

function validateInterest(body) {
  const role = ["farmer", "agent", "buyer"].includes(body.role) ? body.role : null;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  if (!role || name.length < 2 || name.length > 120 || !contact || contact.length > 160 || !location || location.length > 120) {
    return { error: "Provide a valid role, name, contact, and location." };
  }
  return { value: { role, name, contact, location } };
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/health") return send(response, 200, { ok: true, service: "shambalink-api" });
    if (request.method === "GET" && url.pathname === "/api/listings") {
      const store = await loadStore();
      const role = url.searchParams.get("role");
      const search = (url.searchParams.get("search") || "").toLowerCase();
      const listings = store.listings.filter((item) => (!role || role === "all" || item.role === role) && (!search || `${item.crop} ${item.localName} ${item.location}`.toLowerCase().includes(search)));
      return send(response, 200, { listings });
    }
    if (request.method === "POST" && url.pathname === "/api/interests") {
      const validation = validateInterest(await readBody(request));
      if (validation.error) return send(response, 422, { error: validation.error });
      const store = await loadStore();
      const interest = { id: randomUUID(), ...validation.value, createdAt: new Date().toISOString() };
      store.interests.push(interest);
      await saveStore(store);
      return send(response, 201, { interest: { id: interest.id, role: interest.role, createdAt: interest.createdAt } });
    }
    return send(response, 404, { error: "Route not found" });
  } catch (error) {
    console.error(error);
    return send(response, error.status || 500, { error: error.status ? error.message : "Internal server error" });
  }
});

server.listen(port, () => console.log(`ShambaLink API listening on http://localhost:${port}`));
