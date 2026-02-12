import { getAllVehicles } from "./js/githubApi.js";

const container = document.getElementById("vehicleContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let allVehicles = [];

/* ==============================
   🔹 PAGE LOAD
============================== */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    allVehicles = await getAllVehicles();
    renderVehicles(allVehicles);
    updateKPI(allVehicles);
  } catch (error) {
    container.innerHTML = `<p style="color:red;">Failed to load data</p>`;
  }
});

/* ==============================
   🔹 SEARCH
============================== */

searchBtn.addEventListener("click", () => {
  const value = searchInput.value.trim().toLowerCase();

  const filtered = allVehicles.filter(
    (v) =>
      v.vehicleNumber.toLowerCase().includes(value) ||
      v.mobileNumber.includes(value),
  );

  renderVehicles(filtered);
  updateKPI(filtered);
});

/* ==============================
   🔹 RENDER VEHICLES
============================== */

function renderVehicles(vehicles) {
  container.innerHTML = "";

  vehicles.forEach((vehicle, index) => {
    const card = document.createElement("div");
    card.className = "vehicle-card";

    card.innerHTML = `
      <div class="vehicle-header" onclick="toggleAccordion(${index})">
        <div>
          <h3>${vehicle.vehicleNumber}</h3>
          <small>${vehicle.mobileNumber}</small>
        </div>

        <div>
          <span class="status ${vehicle.status.toLowerCase()}">
            ${vehicle.status}
          </span>
          <span class="arrow" id="arrow-${index}">▼</span>
        </div>
      </div>

      <div class="vehicle-body" id="body-${index}">
        <p><strong>Total Visits:</strong> ${vehicle.totalVisits}</p>
        <p><strong>Total Minutes:</strong> ${vehicle.totalMinutesParked}</p>

        ${
          vehicle.status === "IN"
            ? `<p><strong>Current Check-In:</strong> ${vehicle.currentSession.checkIn}</p>`
            : ""
        }

        <!-- ACTION BUTTONS -->
        <div class="action-buttons">
          <button 
            class="btn checkin-btn"
            ${vehicle.status === "IN" ? "disabled" : ""}
            onclick="handleCheckIn(${index})">
            Check In
          </button>

          <button 
            class="btn checkout-btn"
            ${vehicle.status === "OUT" ? "disabled" : ""}
            onclick="handleCheckOut(${index})">
            Check Out
          </button>
        </div>

        ${
          vehicle.history.length > 0
            ? `
          <table class="history-table">
            <thead>
              <tr>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${vehicle.history
                .map(
                  (h) => `
                <tr>
                  <td>${h.checkIn}</td>
                  <td>${h.checkOut}</td>
                  <td>
                    <span class="duration ${getDurationClass(
                      h.durationMinutes,
                    )}">
                      ${h.durationMinutes} min
                    </span>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        `
            : "<p>No History</p>"
        }
      </div>
    `;

    container.appendChild(card);
  });
}

/* ==============================
   🔹 CHECK IN LOGIC
============================== */

window.handleCheckIn = function (index) {
  const vehicle = allVehicles[index];

  if (vehicle.status === "OUT") {
    vehicle.status = "IN";
    vehicle.currentSession = {
      checkIn: new Date().toISOString(),
    };

    vehicle.totalVisits += 1;

    renderVehicles(allVehicles);
    updateKPI(allVehicles);
  }
};

/* ==============================
   🔹 CHECK OUT LOGIC
============================== */

window.handleCheckOut = function (index) {
  const vehicle = allVehicles[index];

  if (vehicle.status === "IN") {
    const checkInTime = new Date(vehicle.currentSession.checkIn);
    const checkOutTime = new Date();

    const durationMinutes = Math.floor((checkOutTime - checkInTime) / 60000);

    vehicle.history.push({
      checkIn: vehicle.currentSession.checkIn,
      checkOut: checkOutTime.toISOString(),
      durationMinutes,
    });

    vehicle.totalMinutesParked += durationMinutes;

    vehicle.status = "OUT";
    vehicle.currentSession = null;

    renderVehicles(allVehicles);
    updateKPI(allVehicles);
  }
};

/* ==============================
   🔹 ACCORDION (Single Open)
============================== */

window.toggleAccordion = function (index) {
  const allBodies = document.querySelectorAll(".vehicle-body");
  const allArrows = document.querySelectorAll(".arrow");

  allBodies.forEach((body, i) => {
    const arrow = allArrows[i];

    if (i === index) {
      body.classList.toggle("open");
      arrow.style.transform = body.classList.contains("open")
        ? "rotate(180deg)"
        : "rotate(0deg)";
    } else {
      body.classList.remove("open");
      arrow.style.transform = "rotate(0deg)";
    }
  });
};

/* ==============================
   🔹 KPI UPDATE
============================== */

function updateKPI(vehicles) {
  const total = vehicles.length;
  const inCount = vehicles.filter((v) => v.status === "IN").length;
  const outCount = vehicles.filter((v) => v.status === "OUT").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("inCount").textContent = inCount;
  document.getElementById("outCount").textContent = outCount;
}

/* ==============================
   🔹 DURATION COLOR LOGIC
============================== */

function getDurationClass(minutes) {
  if (minutes < 60) return "short";
  if (minutes < 120) return "medium";
  return "long";
}
