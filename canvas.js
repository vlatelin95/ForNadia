const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

let width, height;
let stars = [];
let meteors = [];

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];

    for (let i = 0; i < 180; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height * 0.8,
            size: Math.random() * 1.5 + 0.3,
            alpha: Math.random(),
            speed: Math.random() * 0.02 + 0.005
        });
    }
}

function createMeteor() {
    meteors.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.4,
        length: Math.random() * 100 + 60,
        speed: Math.random() * 7 + 5,
        alpha: 1
    });
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Мерцающие звёзды
    stars.forEach(star => {
        star.alpha += star.speed;

        if (star.alpha > 1 || star.alpha < 0.2) {
            star.speed *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fill();
    });

    // Падающие метеоры
    meteors.forEach((meteor, index) => {
        const gradient = ctx.createLinearGradient(
            meteor.x,
            meteor.y,
            meteor.x - meteor.length,
            meteor.y - meteor.length
        );

        gradient.addColorStop(0, "rgba(255,255,255,0.9)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(
            meteor.x - meteor.length,
            meteor.y - meteor.length
        );
        ctx.stroke();

        meteor.x += meteor.speed;
        meteor.y += meteor.speed;
        meteor.alpha -= 0.008;

        if (meteor.alpha <= 0 || meteor.y > height) {
            meteors.splice(index, 1);
        }
    });

    if (Math.random() < 0.008) {
        createMeteor();
    }

    requestAnimationFrame(draw);
}

resize();
window.addEventListener("resize", resize);
draw();
      
