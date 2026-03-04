const schools = [
  {
    short: "Brown",
    full: "Brown University",
    color: "#f57f20",
    monogram: "B",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/38/Brown_University_shield.svg/120px-Brown_University_shield.svg.png",
  },
  {
    short: "Columbia",
    full: "Columbia University",
    color: "#9fb0c9",
    monogram: "C",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Columbia_University_shield.svg/120px-Columbia_University_shield.svg.png",
  },
  {
    short: "Cornell",
    full: "Cornell University",
    color: "#b31b1b",
    monogram: "CU",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Cornell_University_seal.svg/120px-Cornell_University_seal.svg.png",
  },
  {
    short: "Dartmouth",
    full: "Dartmouth College",
    color: "#00693e",
    monogram: "D",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Dartmouth_College_shield.svg/120px-Dartmouth_College_shield.svg.png",
  },
  {
    short: "Harvard",
    full: "Harvard University",
    color: "#a51c30",
    monogram: "H",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/342px-Harvard_shield_wreath.svg.png",
  },
  {
    short: "Penn",
    full: "University of Pennsylvania",
    color: "#011f5b",
    monogram: "P",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/UPenn_shield_with_banner.svg/120px-UPenn_shield_with_banner.svg.png",
  },
  {
    short: "Princeton",
    full: "Princeton University",
    color: "#ee7f2d",
    monogram: "PU",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/120px-Princeton_seal.svg.png",
  },
  {
    short: "Yale",
    full: "Yale University",
    color: "#00356b",
    monogram: "Y",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Yale_University_Shield_1.svg/120px-Yale_University_Shield_1.svg.png",
  },
];

const decisions = [
  { label: "Accepted", className: "decision-accepted", weight: 0.24 },
  { label: "Waitlisted", className: "decision-waitlisted", weight: 0.26 },
  { label: "Rejected", className: "decision-rejected", weight: 0.5 },
];

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const revealBtn = document.getElementById("revealBtn");
const resetBtn = document.getElementById("resetBtn");
const ivyLogoStrip = document.getElementById("ivyLogoStrip");
const schoolResult = document.getElementById("schoolResult");
const schoolLogo = document.getElementById("schoolLogo");
const decisionResult = document.getElementById("decisionResult");

let spinning = false;
let pendingSchool = null;
let revealed = false;
let currentRotation = 0;

function applyImageFallback(img, fallbackText) {
  img.addEventListener(
    "error",
    () => {
      img.classList.add("logo-hidden");
      const fallback = document.createElement("span");
      fallback.className = "logo-fallback";
      fallback.textContent = fallbackText;
      img.parentElement?.appendChild(fallback);
    },
    { once: true },
  );
}

function buildWheel() {
  const segmentSize = 360 / schools.length;
  const gradientStops = schools
    .map((school, idx) => {
      const start = idx * segmentSize;
      const end = (idx + 1) * segmentSize;
      return `${school.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  wheel.style.background = `conic-gradient(${gradientStops})`;

  schools.forEach((school, idx) => {
    const label = document.createElement("div");
    label.className = "segment-label";
    const angle = idx * segmentSize + segmentSize / 2 - 90;
    label.style.transform = `rotate(${angle}deg) translate(16px, -50%)`;
    const chip = document.createElement("div");
    chip.className = "segment-chip";
    chip.style.transform = `rotate(${-angle}deg)`;

    const logo = document.createElement("img");
    logo.src = school.logo;
    logo.alt = `${school.full} logo`;
    logo.loading = "lazy";
    applyImageFallback(logo, school.monogram);

    const text = document.createElement("span");
    text.textContent = school.short;

    chip.appendChild(logo);
    chip.appendChild(text);
    label.appendChild(chip);
    wheel.appendChild(label);
  });
}

function buildLogoStrip() {
  schools.forEach((school) => {
    const item = document.createElement("div");
    item.className = "ivy-logo-item";

    const logo = document.createElement("img");
    logo.src = school.logo;
    logo.alt = `${school.full} logo`;
    logo.loading = "lazy";
    applyImageFallback(logo, school.monogram);

    const label = document.createElement("p");
    label.className = "ivy-logo-name";
    label.textContent = school.short;
    item.appendChild(logo);
    item.appendChild(label);
    ivyLogoStrip.appendChild(item);
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

function resetSchoolUI() {
  schoolResult.textContent = "Waiting for spin...";
  schoolLogo.classList.add("school-logo-hidden");
  schoolLogo.src = "";
  schoolLogo.alt = "";
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
  schoolResult.textContent = pendingSchool.full;
  schoolLogo.src = pendingSchool.logo;
  schoolLogo.alt = `${pendingSchool.full} logo`;
  schoolLogo.onerror = () => {
    schoolLogo.classList.add("school-logo-hidden");
  };
  schoolLogo.classList.remove("school-logo-hidden");
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
  resetSchoolUI();
  resetDecisionUI();
  revealBtn.disabled = true;
});

buildLogoStrip();
buildWheel();
