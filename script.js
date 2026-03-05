const schools = [
  {
    short: "Brown",
    full: "Brown University",
    color: "rgb(78, 42, 28)",
    monogram: "B",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Brown_Coat_of_Arms.svg",
  },
  {
    short: "Columbia",
    full: "Columbia University",
    color: "rgb(155, 196, 226)",
    monogram: "C",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Columbia_University_Shield.svg",
  },
  {
    short: "Cornell",
    full: "Cornell University",
    color: "rgb(179, 27, 27)",
    monogram: "CU",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Cornell_University_seal.svg",
  },
  {
    short: "Dartmouth",
    full: "Dartmouth College",
    color: "rgb(0, 112, 60)",
    monogram: "D",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Dartmouth_College_Big_Green_logo.svg",
  },
  {
    short: "Harvard",
    full: "Harvard University",
    color: "rgb(165, 28, 48)",
    monogram: "H",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Harvard_University_shield.svg",
  },
  {
    short: "Penn",
    full: "University of Pennsylvania",
    color: "rgb(1, 31, 91)",
    monogram: "P",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/UPenn_shield_with_banner.svg",
  },
  {
    short: "Princeton",
    full: "Princeton University",
    color: "rgb(255, 143, 0)",
    monogram: "PU",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Princeton_University_Shield.svg",
  },
  {
    short: "Yale",
    full: "Yale University",
    color: "rgb(0, 53, 107)",
    monogram: "Y",
    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Yale_University_Shield_1.svg",
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
const selectedCount = document.getElementById("selectedCount");
const selectionHint = document.getElementById("selectionHint");
const removeModal = document.getElementById("removeModal");
const modalMessage = document.getElementById("modalMessage");
const removeSchoolBtn = document.getElementById("removeSchoolBtn");
const keepSchoolBtn = document.getElementById("keepSchoolBtn");

const selectedSchools = new Set(schools.map((school) => school.short));

let spinning = false;
let pendingSchool = null;
let revealed = false;
let currentRotation = 0;
let modalOpen = false;

const confettiCanvas = document.createElement("canvas");
const confettiCtx = confettiCanvas.getContext("2d");
confettiCanvas.style.position = "fixed";
confettiCanvas.style.inset = "0";
confettiCanvas.style.width = "100vw";
confettiCanvas.style.height = "100vh";
confettiCanvas.style.pointerEvents = "none";
confettiCanvas.style.zIndex = "30";
document.body.appendChild(confettiCanvas);

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

function getActiveSchools() {
  return schools.filter((school) => selectedSchools.has(school.short));
}

function getWheelLabelRadius(activeCount) {
  if (activeCount <= 3) return 126;
  if (activeCount <= 5) return 108;
  return 94;
}

function resetWheelPosition() {
  currentRotation = 0;
  wheel.style.transition = "none";
  wheel.style.transform = "rotate(0deg)";
  void wheel.offsetWidth;
  wheel.style.transition = "transform 4.8s cubic-bezier(0.15, 0.7, 0.05, 1)";
}

function openRemovalModal(school) {
  modalMessage.textContent = `Do you want to remove ${school.full} from the wheel?`;
  removeModal.classList.remove("modal-hidden");
  modalOpen = true;
}

function closeRemovalModal() {
  removeModal.classList.add("modal-hidden");
  modalOpen = false;
}

function buildWheel() {
  const activeSchools = getActiveSchools();
  const segmentSize = 360 / activeSchools.length;
  const labelRadiusPx = getWheelLabelRadius(activeSchools.length);
  const gradientStops = activeSchools
    .map((school, idx) => {
      const start = idx * segmentSize;
      const end = (idx + 1) * segmentSize;
      return `${school.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  wheel.querySelectorAll(".segment-label").forEach((node) => node.remove());
  wheel.style.background = `conic-gradient(${gradientStops})`;

  activeSchools.forEach((school, idx) => {
    const label = document.createElement("div");
    label.className = "segment-label";
    const angle = idx * segmentSize + segmentSize / 2 - 90;
    label.style.transform = `rotate(${angle}deg) translate(${labelRadiusPx}px, -50%)`;

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

function updateSelectionUI() {
  const count = selectedSchools.size;
  selectedCount.textContent = `${count} selected`;
  ivyLogoStrip.querySelectorAll(".ivy-logo-item").forEach((item) => {
    const schoolKey = item.dataset.school;
    const active = selectedSchools.has(schoolKey);
    item.classList.toggle("ivy-logo-item-active", active);
    item.classList.toggle("ivy-logo-item-inactive", !active);
    item.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function clearStateForSelectionChange() {
  spinning = false;
  pendingSchool = null;
  revealed = false;
  closeRemovalModal();
  revealBtn.disabled = true;
  resetDecisionUI();
  resetSchoolUI();
  resetWheelPosition();
}

function buildLogoStrip() {
  schools.forEach((school) => {
    const item = document.createElement("button");
    item.className = "ivy-logo-item ivy-logo-item-active";
    item.type = "button";
    item.dataset.school = school.short;
    item.setAttribute("aria-pressed", "true");
    item.setAttribute("aria-label", `Toggle ${school.full}`);

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

    item.addEventListener("click", () => {
      if (spinning || modalOpen) return;

      if (selectedSchools.has(school.short)) {
        if (selectedSchools.size === 1) {
          selectionHint.textContent = "Keep at least one school selected.";
          return;
        }
        selectedSchools.delete(school.short);
      } else {
        selectedSchools.add(school.short);
      }

      selectionHint.textContent = "";
      updateSelectionUI();
      clearStateForSelectionChange();
      buildWheel();
    });
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

function runConfetti(durationMs = 4000) {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  confettiCanvas.width = Math.floor(width * dpr);
  confettiCanvas.height = Math.floor(height * dpr);
  confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = [
    "rgb(78, 42, 28)",
    "rgb(155, 196, 226)",
    "rgb(179, 27, 27)",
    "rgb(0, 112, 60)",
    "rgb(165, 28, 48)",
    "rgb(1, 31, 91)",
    "rgb(255, 143, 0)",
    "rgb(0, 53, 107)",
  ];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.5,
    size: 5 + Math.random() * 7,
    vx: -2 + Math.random() * 4,
    vy: 2 + Math.random() * 4,
    gravity: 0.05 + Math.random() * 0.08,
    rotation: Math.random() * Math.PI * 2,
    vr: -0.15 + Math.random() * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  const start = performance.now();
  function frame(now) {
    confettiCtx.clearRect(0, 0, width, height);
    pieces.forEach((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    });

    if (now - start < durationMs) {
      requestAnimationFrame(frame);
    } else {
      confettiCtx.clearRect(0, 0, width, height);
    }
  }
  requestAnimationFrame(frame);
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
  if (spinning || modalOpen) return;

  const activeSchools = getActiveSchools();
  if (!activeSchools.length) return;

  spinning = true;
  revealed = false;
  revealBtn.disabled = true;
  resetDecisionUI();

  const segmentSize = 360 / activeSchools.length;
  const landingIndex = Math.floor(Math.random() * activeSchools.length);
  pendingSchool = activeSchools[landingIndex];

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
  if (!spinning || !pendingSchool) return;
  spinning = false;
  schoolResult.textContent = pendingSchool.full;
  schoolLogo.src = pendingSchool.logo;
  schoolLogo.alt = `${pendingSchool.full} logo`;
  schoolLogo.onerror = () => {
    schoolLogo.classList.add("school-logo-hidden");
  };
  schoolLogo.classList.remove("school-logo-hidden");
  runConfetti();
  revealBtn.disabled = false;
  openRemovalModal(pendingSchool);
});

spinBtn.addEventListener("click", spinWheel);
wheel.addEventListener("click", spinWheel);

revealBtn.addEventListener("click", () => {
  if (spinning || modalOpen || !pendingSchool || revealed) return;
  const pick = weightedDecision();
  decisionResult.textContent = pick.label;
  decisionResult.className = pick.className;
  revealed = true;
});

removeSchoolBtn.addEventListener("click", () => {
  if (!pendingSchool) {
    closeRemovalModal();
    return;
  }

  if (selectedSchools.size === 1) {
    selectionHint.textContent = "You need at least one school on the wheel.";
    closeRemovalModal();
    return;
  }

  selectedSchools.delete(pendingSchool.short);
  selectionHint.textContent = `${pendingSchool.short} removed from the wheel.`;
  updateSelectionUI();
  clearStateForSelectionChange();
  buildWheel();
});

keepSchoolBtn.addEventListener("click", () => {
  closeRemovalModal();
});

resetBtn.addEventListener("click", () => {
  spinning = false;
  pendingSchool = null;
  revealed = false;
  closeRemovalModal();
  resetWheelPosition();
  resetSchoolUI();
  resetDecisionUI();
  revealBtn.disabled = true;
});

buildLogoStrip();
updateSelectionUI();
buildWheel();
