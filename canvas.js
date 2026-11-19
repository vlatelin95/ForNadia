(() => {
  "use strict";

  const canvas = document.getElementById("sky");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let meteors = [];
  let lastMeteor = 0;
  let animationFrame = 0;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(
      190,
      Math.max(65, Math.floor(width * height / 6500))
    );

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.73,
      radius: Math.random() * 1.15 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.25,
      base: Math.random() * 0.45 + 0.35
    }));
  }

  function createMeteor() {
    if (meteors.length >= 2) return;

    const startX = Math.random() * width * 0.9 + width * 0.05;

    meteors.push({
      x: startX,
      y: Math.random() * height * 0.35,
      length: 65 + Math.random() * 85,
      speed: 420 + Math.random() * 220,
      life: 0,
      duration: 0.65 + Math.random() * 0.35
    });
  }

  let lastTime = 0;

  function draw(time) {
    const dt = lastTime
      ? Math.min((time - lastTime) / 1000, 0.04)
      : 0;

    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    // Мерцающие звёзды.
    for (const star of stars) {
      const alpha = star.base +
        Math.sin(time * 0.001 * star.speed + star.phase) * 0.22;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 247, 239, ${Math.max(0.08, alpha)})`;
      ctx.fill();
    }

    // Падающие метеоры.
    for (let i = meteors.length - 1; i >= 0; i--) {
      const meteor = meteors[i];

      meteor.life += dt / meteor.duration;
      meteor.x -= meteor.speed * dt;
      meteor.y += meteor.speed * dt * 0.55;

      const opacity = Math.sin(Math.PI * Math.min(1, meteor.life));

      const gradient = ctx.createLinearGradient(
        meteor.x,
        meteor.y,
        meteor.x + meteor.length,
        meteor.y - meteor.length * 0.55
      );

      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(1, `rgba(255,245,225,${opacity * 0.9})`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(
        meteor.x + meteor.length,
        meteor.y - meteor.length * 0.55
      );
      ctx.stroke();

      if (meteor.life >= 1 || meteor.y > height) {
        meteors.splice(i, 1);
      }
    }

    // Новый метеор появляется не слишком часто.
    if (
      !reducedMotion &&
      time - lastMeteor > 6500 + Math.random() * 7000
    ) {
      createMeteor();
      lastMeteor = time;
    }

    animationFrame = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  animationFrame = requestAnimationFrame(draw);

  // Корректно останавливаем анимацию, если вкладка скрыта.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      lastTime = 0;
    } else {
      lastTime = 0;
      animationFrame = requestAnimationFrame(draw);
    }
  });
})();
    
