(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const envelope = $("#envelopeButton");
  const overlay = $("#letterOverlay");
  const closeButton = $("#closeLetter");
  const welcome = $("#welcome");
  const world = $("#world");

  if (!envelope || !overlay || !closeButton || !welcome || !world) {
    console.error("ForNadia: не найдены необходимые элементы HTML.");
    return;
  }

  let opening = false;
  let previousFocus = null;

  function openLetter() {
    if (opening || !overlay.hidden) return;

    opening = true;
    previousFocus = document.activeElement;

    envelope.classList.add("opened");
    envelope.setAttribute("aria-expanded", "true");

    window.setTimeout(() => {
      welcome.classList.add("leaving");
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");

      requestAnimationFrame(() => {
        overlay.classList.add("show");
        closeButton.focus();
        opening = false;
      });
    }, 650);
  }

  function closeLetter() {
    if (overlay.hidden || opening) return;

    opening = true;
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
      overlay.hidden = true;
      welcome.classList.remove("leaving");
      envelope.classList.remove("opened");
      envelope.setAttribute("aria-expanded", "false");

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }

      opening = false;
    }, 650);
  }

  envelope.addEventListener("click", openLetter);
  closeButton.addEventListener("click", closeLetter);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLetter();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      closeLetter();
    }
  });

  // Небольшое движение слоёв для ощущения глубины.
  const motionLayers = [
    { element: $("#clouds"), amount: 8 },
    { element: $("#hills"), amount: 3 },
    { element: $("#grass"), amount: 2 }
  ].filter(item => item.element);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frameRequested = false;

  function updateParallax() {
    currentX += (targetX - currentX) * 0.035;
    currentY += (targetY - currentY) * 0.035;

    motionLayers.forEach(({ element, amount }) => {
      element.style.translate =
        `${currentX * amount}px ${currentY * amount}px`;
    });

    if (
      Math.abs(targetX - currentX) > 0.01 ||
      Math.abs(targetY - currentY) > 0.01
    ) {
      requestAnimationFrame(updateParallax);
    } else {
      frameRequested = false;
    }
  }

  function setParallax(x, y) {
    targetX = x;
    targetY = y;

    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(updateParallax);
    }
  }

  world.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    const rect = world.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setParallax(-x, -y);
  }, { passive: true });

  world.addEventListener("pointerleave", () => {
    setParallax(0, 0);
  });

  // Светлячки на переднем плане.
  const fireflies = $("#fireflies");

  if (fireflies) {
    const count = window.innerWidth < 600 ? 12 : 22;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
      dot.className = "firefly";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 90}%`;
      dot.style.setProperty("--duration", `${5 + Math.random() * 8}s`);
      dot.style.setProperty("--delay", `${Math.random() * -12}s`);
      fireflies.appendChild(dot);
    }
  }

  // Не даём браузеру прокручивать страницу под открытым письмом.
  overlay.addEventListener("wheel", (event) => {
    if (!overlay.hidden && !event.target.closest(".letter")) {
      event.preventDefault();
    }
  }, { passive: false });
})();
    
