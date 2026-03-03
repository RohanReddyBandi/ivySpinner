const schools = [
  "Brown",
  "Columbia",
  "Cornell",
  "Dartmouth",
  "Harvard",
  "Penn",
  "Princeton",
  "Yale",
];

const decisions = [
  { label: "Accepted", className: "decision-accepted", weight: 0.24 },
  { label: "Waitlisted", className: "decision-waitlisted", weight: 0.26 },
  { label: "Rejected", className: "decision-rejected", weight: 0.5 },
];

const palette = [
  "#0f4f7f",
  "#1f7a63",
  "#b5532f",
  "#7a1c2d",
  "#c29b40",
  "#204e80",
  "#8f4f1b",
  "#2f6f8b",
];

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const revealBtn = document.getElementById("revealBtn");
const resetBtn = document.getElementById("resetBtn");
const schoolResult = document.getElementById("schoolResult");
const decisionResult = document.getElementById("decisionResult");

let spinning = false;
let pendingSchool = null;
let revealed = false;
let currentRotation = 0;

function buildWheel() {
  const segmentSize = 360 / schools.length;
  const gradientStops = schools
    .map((_, idx) => {
      const start = idx * segmentSize;
      const end = (idx + 1) * segmentSize;
      return `${palette[idx % palette.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  wheel.style.background = `conic-gradient(${gradientStops})`;

  schools.forEach((school, idx) => {
    const label = document.createElement("span");
    label.className = "segment-label";
    const angle = idx * segmentSize + segmentSize / 2 - 90;
    label.style.transform = `rotate(${angle}deg) translate(16px, -50%)`;
    label.textContent = school;
    wheel.appendChild(label);
  });
}

function weightedDecision() {
  const roll = Math.random();
  let cumulative = 0;

  for (const option of decisions) {
    cumulative += option.weight;
    if (roll <= cumulative) return option;
  }

  return decisions[decisions.length - 1];
}

function resetDecisionUI() {
  decisionResult.textContent = "Hidden";
  decisionResult.className = "";
}

function spinWheel() {
  if (spinning) return;

  spinning = true;
  revealed = false;
  revealBtn.disabled = true;
  resetDecisionUI();

  const segmentSize = 360 / schools.length;
  const landingIndex = Math.floor(Math.random() * schools.length);
  pendingSchool = schools[landingIndex];

  const centerOfSegment = landingIndex * segmentSize + segmentSize / 2;
  const pointerAngle = 0;
  const landingRotation = pointerAngle - centerOfSegment;
  const extraTurns = 360 * (5 + Math.floor(Math.random() * 3));
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const settleDelta = ((landingRotation - currentMod) % 360 + 360) % 360;
  currentRotation += extraTurns + settleDelta;

  wheel.style.transform = `rotate(${currentRotation}deg)`;
}

wheel.addEventListener("transitionend", () => {
  if (!spinning) return;
  spinning = false;
  schoolResult.textContent = pendingSchool;
  revealBtn.disabled = false;
});

spinBtn.addEventListener("click", spinWheel);

revealBtn.addEventListener("click", () => {
  if (spinning || !pendingSchool || revealed) return;
  const pick = weightedDecision();
  decisionResult.textContent = pick.label;
  decisionResult.className = pick.className;
  revealed = true;
});

resetBtn.addEventListener("click", () => {
  spinning = false;
  pendingSchool = null;
  revealed = false;
  currentRotation = 0;
  wheel.style.transition = "none";
  wheel.style.transform = "rotate(0deg)";
  // Force reflow so transition can be restored for future spins.
  void wheel.offsetWidth;
  wheel.style.transition = "transform 4.8s cubic-bezier(0.15, 0.7, 0.05, 1)";
  schoolResult.textContent = "Waiting for spin...";
  resetDecisionUI();
  revealBtn.disabled = true;
});

buildWheel();
