function setupMenu() {
  const menuButton = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav-links");

  if (!menuButton || !nav) return;

  menuButton.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
    nav.classList.toggle("nav-open");

    if (nav.classList.contains("nav-open")) {
      nav.style.display = "grid";
      nav.style.position = "fixed";
      nav.style.inset = "68px 0 auto 0";
      nav.style.background = "var(--paper)";
      nav.style.padding = "24px 20px 30px";
      nav.style.borderBottom = "1px solid var(--line)";
      nav.style.zIndex = "99";
    } else {
      nav.removeAttribute("style");
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      nav.classList.remove("nav-open");
      nav.removeAttribute("style");
    });
  });
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupCursor() {
  const cursor = document.querySelector(".cursor-dot");
  if (!cursor || !matchMedia("(pointer:fine)").matches) return;

  window.addEventListener("pointermove", (event) => {
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";
  });

  document
    .querySelectorAll("a, button, .stage-card, .verify-box")
    .forEach((element) => {
      element.addEventListener("mouseenter", () => {
        cursor.style.width = "22px";
        cursor.style.height = "22px";
      });

      element.addEventListener("mouseleave", () => {
        cursor.style.width = "12px";
        cursor.style.height = "12px";
      });
    });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function renderVerifiedCertificate(result, record) {
  result.innerHTML =
    '<div class="verify-status"><span class="dot"></span>Verified certificate</div>' +
    '<div class="result-name">' +
    escapeHtml(record.name) +
    "</div>" +
    '<p class="verify-help">الشهادة مسجلة ضمن نظام التحقق لدى Aibraham.</p>' +
    '<div class="result-grid">' +
    '<div class="result-item"><span>Course</span><strong>' +
    escapeHtml(record.course) +
    "</strong></div>" +
    '<div class="result-item"><span>Training hours</span><strong>' +
    escapeHtml(record.hours) +
    "</strong></div>" +
    (record.certificateId
      ? '<div class="result-item"><span>Certificate ID</span><strong>' +
        escapeHtml(record.certificateId) +
        "</strong></div>"
      : "") +
    '<div class="result-item"><span>Status</span><strong>' +
    (record.status === "valid" ? "Valid / سارية" : "Revoked / ملغاة") +
    "</strong></div>" +
    "</div>";
}

function renderVerificationFailure(result) {
  result.innerHTML =
    '<div class="verify-status"><span class="dot"></span>Verification failed</div>' +
    '<div class="result-name">لم يتم العثور على شهادة</div>' +
    '<p class="verify-help">تأكد من الرمز كما يظهر في رابط أو رمز QR الخاص بالشهادة.</p>';
}

function setupCertificateVerification() {
  const certificateBox = document.querySelector("[data-verify]");
  if (!certificateBox) return;

  const form = certificateBox.querySelector("form");
  const input = certificateBox.querySelector("input");
  const result = certificateBox.querySelector(".verify-result");

  let records = [];

  function getTokenFromLocation() {
    const path = location.pathname.split("/").filter(Boolean);
    if (path[0] === "verify" && path[1]) {
      return decodeURIComponent(path[1]);
    }

    return new URLSearchParams(location.search).get("token");
  }

  function verify(token) {
    const cleanToken = (token || "").trim();
    const record = records.find((item) => item.token === cleanToken);

    result.classList.add("show");

    if (!record) {
      renderVerificationFailure(result);
      return;
    }

    renderVerifiedCertificate(result, record);
  }

  fetch("certificates.json")
    .then((response) => response.json())
    .then((registry) => {
      records = registry.records || [];

      const tokenFromLocation = getTokenFromLocation();
      if (!tokenFromLocation) return;

      input.value = tokenFromLocation;
      verify(tokenFromLocation);
    })
    .catch(() => {
      records = [];
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    verify(input.value);
  });
}

setupMenu();
setupRevealAnimations();
setupCursor();
setupCertificateVerification();
