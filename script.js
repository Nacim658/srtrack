(() => {
    "use strict";

    // Attendre que le DOM soit chargé
    document.addEventListener("DOMContentLoaded", () => {

        // =====================================================
        // ELEMENTS
        // =====================================================
        const canvas = document.getElementById("scene");
        const progressBar = document.getElementById("progress");
        const sections = document.querySelectorAll(".scene-text");

        if (!canvas) return console.error("Canvas #scene introuvable.");
        const ctx = canvas.getContext("2d");
        if (!ctx) return console.error("Canvas 2D impossible à initialiser.");

        // =====================================================
        // CONFIGURATION
        // =====================================================
        let width = window.innerWidth;
        let height = window.innerHeight;
        let scrollProgress = 0;

        // Véhicules (fourgons)
        const vehicles = [
            { x: 0.30, y: 0.64, speed: 0.00008, scale: 1, dir: 1 },
            { x: 0.62, y: 0.54, speed: -0.00006, scale: 0.82, dir: -1 },
            { x: 0.46, y: 0.72, speed: 0.00005, scale: 0.68, dir: 1 }
        ];

        // Particules
        const particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.0002 + 0.00005
            });
        }

        // =====================================================
        // RESIZE
        // =====================================================
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            const ratio = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = width * ratio;
            canvas.height = height * ratio;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        window.addEventListener("resize", resize);
        resize();

        // =====================================================
        // SCROLL
        // =====================================================
        function updateScroll() {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) {
                scrollProgress = 0;
            } else {
                scrollProgress = window.scrollY / maxScroll;
            }
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));

            // Barre de progression
            if (progressBar) {
                progressBar.style.width = `${scrollProgress * 100}%`;
            }

            // Activation des sections
            sections.forEach(section => {
                const start = parseFloat(section.dataset.start);
                const end = parseFloat(section.dataset.end);

                if (scrollProgress >= start && scrollProgress <= end) {
                    section.classList.add("active");
                } else {
                    section.classList.remove("active");
                }
            });
        }

        window.addEventListener("scroll", updateScroll, { passive: true });
        updateScroll();

        // =====================================================
        // OUTILS GRAPHIQUES
        // =====================================================
        function lerp(a, b, amount) {
            return a + (b - a) * amount;
        }

        // =====================================================
        // DESSINS
        // =====================================================

        // 1. Fond
        function drawBackground() {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#030507");
            gradient.addColorStop(0.55, "#080d12");
            gradient.addColorStop(1, "#11171d");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Halo
            const glow = ctx.createRadialGradient(
                width * 0.5, height * 0.42, 20,
                width * 0.5, height * 0.42, width * 0.65
            );
            glow.addColorStop(0, "rgba(70,130,150,0.16)");
            glow.addColorStop(0.45, "rgba(20,50,65,0.07)");
            glow.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Bâtiment
        function drawBuilding(progress) {
            const x = lerp(width * 0.72, width * 0.12, progress);
            const y = height * 0.20;
            const w = width * 0.28;
            const h = height * 0.42;

            ctx.fillStyle = "#1c252c";
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = "rgba(255,255,255,0.035)";
            ctx.fillRect(x + 10, y + 10, w - 20, h - 20);

            // Fenêtres
            const rows = 4, cols = 5;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const wx = x + 25 + col * ((w - 50) / cols);
                    const wy = y + 30 + row * ((h - 60) / rows);
                    ctx.fillStyle = "rgba(53,213,239,0.15)";
                    ctx.fillRect(wx, wy, 25, 18);
                }
            }

            // Enseigne
            ctx.fillStyle = "rgba(229,173,80,0.9)";
            ctx.font = "bold 14px Arial";
            ctx.fillText("S.R.TRACK", x + 24, y + h - 25);
        }

        // 3. Route
        function drawRoad() {
            const horizon = height * 0.48;

            // Sol
            ctx.fillStyle = "#151b20";
            ctx.beginPath();
            ctx.moveTo(0, horizon);
            ctx.lineTo(width, horizon);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();

            // Route
            ctx.fillStyle = "#20262b";
            ctx.beginPath();
            ctx.moveTo(width * 0.38, horizon);
            ctx.lineTo(width * 0.62, horizon);
            ctx.lineTo(width * 0.86, height);
            ctx.lineTo(width * 0.14, height);
            ctx.closePath();
            ctx.fill();

            // Ligne centrale
            ctx.strokeStyle = "#d8a33f";
            ctx.lineWidth = 3;
            ctx.setLineDash([35, 25]);
            ctx.beginPath();
            ctx.moveTo(width * 0.50, horizon);
            ctx.lineTo(width * 0.50, height);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 4. Fourgon
        function drawVan(x, y, scale, direction) {
            const w = 150 * scale;
            const h = 75 * scale;

            ctx.save();
            ctx.translate(x, y);
            if (direction < 0) ctx.scale(-1, 1);

            // Ombre
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.beginPath();
            ctx.ellipse(0, 8 * scale, w * 0.55, 13 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Carrosserie
            ctx.fillStyle = "#d9dde0";
            ctx.beginPath();
            ctx.roundRect(-w / 2, -h / 2, w, h, 9 * scale);
            ctx.fill();

            // Partie avant
            ctx.fillStyle = "#bfc5c9";
            ctx.beginPath();
            ctx.moveTo(w / 2, -h / 2);
            ctx.lineTo(w / 2 + 20 * scale, -h / 2 + 15 * scale);
            ctx.lineTo(w / 2 + 20 * scale, h / 2);
            ctx.lineTo(w / 2, h / 2);
            ctx.closePath();
            ctx.fill();

            // Vitres
            ctx.fillStyle = "#17252d";
            ctx.fillRect(15 * scale, -h / 2 + 9 * scale, 42 * scale, 25 * scale);
            ctx.fillRect(-w / 2 + 15 * scale, -h / 2 + 9 * scale, 40 * scale, 25 * scale);

            // Ligne latérale
            ctx.fillStyle = "#e5ad50";
            ctx.fillRect(-w / 2, 7 * scale, w, 4 * scale);

            // Logo
            ctx.fillStyle = "#10151a";
            ctx.font = `bold ${12 * scale}px Arial`;
            ctx.fillText("S.R.TRACK", -42 * scale, 3 * scale);

            // Roues
            const wheelY = h / 2 - 4 * scale;
            [-w * 0.32, w * 0.30].forEach(wheelX => {
                ctx.fillStyle = "#090b0d";
                ctx.beginPath();
                ctx.arc(wheelX, wheelY, 13 * scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#60676c";
                ctx.beginPath();
                ctx.arc(wheelX, wheelY, 5 * scale, 0, Math.PI * 2);
                ctx.fill();
            });

            // GPS
            ctx.fillStyle = "#35d5ef";
            ctx.shadowColor = "#35d5ef";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, -h / 2 - 5 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.restore();
        }

        // 5. Atelier
        function drawWorkshop(progress) {
            if (progress < 0.30 || progress > 0.65) return;

            const alpha = Math.sin(Math.min(1, (progress - 0.30) * 5) * Math.PI);
            ctx.save();
            ctx.globalAlpha = Math.max(0.25, alpha);

            const x = width * 0.64;
            const y = height * 0.23;
            const w = width * 0.27;
            const h = height * 0.34;

            ctx.fillStyle = "#252d34";
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = "#10161b";
            ctx.fillRect(x + 25, y + 65, w - 50, h - 85);

            ctx.fillStyle = "rgba(229,173,80,0.14)";
            ctx.fillRect(x + 35, y + 75, w - 70, h - 105);

            ctx.fillStyle = "#e5ad50";
            ctx.font = "bold 13px Arial";
            ctx.fillText("ATELIER TECHNIQUE", x + 20, y + 35);

            ctx.restore();
        }

        // 6. Réseau / GPS
        function drawNetwork(progress) {
            if (progress < 0.18) return;

            const centerX = width * 0.50;
            const centerY = height * 0.28;
            const radius = 100 + Math.sin(performance.now() * 0.002) * 12;

            ctx.strokeStyle = "rgba(53,213,239,0.16)";
            ctx.lineWidth = 1;

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + i * 35, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.fillStyle = "#35d5ef";
            ctx.shadowColor = "#35d5ef";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // 7. Cybersécurité
        function drawCyber(progress) {
            if (progress < 0.62) return;

            const x = width * 0.08;
            const y = height * 0.18;

            ctx.fillStyle = "rgba(8,14,19,0.75)";
            ctx.fillRect(x, y, width * 0.28, height * 0.25);

            ctx.strokeStyle = "rgba(53,213,239,0.35)";
            ctx.strokeRect(x, y, width * 0.28, height * 0.25);

            ctx.fillStyle = "#35d5ef";
            ctx.font = "bold 13px Arial";
            ctx.fillText("SECURITY MONITORING", x + 20, y + 28);

            for (let i = 0; i < 5; i++) {
                const lineY = y + 55 + i * 22;
                ctx.fillStyle = i === 3 ? "#e5ad50" : "#394850";
                ctx.fillRect(x + 20, lineY, 150 + i * 15, 5);
            }
        }

        // 8. Particules
        function drawParticles() {
            particles.forEach(p => {
                p.y -= p.speed;
                if (p.y < 0) p.y = 1;

                ctx.fillStyle = "rgba(255,255,255,0.18)";
                ctx.beginPath();
                ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // =====================================================
        // ANIMATION LOOP
        // =====================================================
        function animate() {
            requestAnimationFrame(animate);

            // 1. Fond
            drawBackground();

            // 2. Éléments statiques / progressifs
            drawBuilding(scrollProgress);
            drawRoad();
            drawWorkshop(scrollProgress);
            drawNetwork(scrollProgress);
            drawCyber(scrollProgress);

            // 3. Véhicules
            vehicles.forEach(vehicle => {
                vehicle.x += vehicle.speed;

                // Reset position
                if (vehicle.x > 1.15) vehicle.x = -0.15;
                if (vehicle.x < -0.15) vehicle.x = 1.15;

                const roadCenter = width * 0.50;
                const roadWidth = width * 0.36;
                const x = roadCenter + (vehicle.x - 0.5) * roadWidth;
                const y = height * vehicle.y;

                drawVan(x, y, vehicle.scale, vehicle.speed >= 0 ? 1 : -1);
            });

            // 4. Particules
            drawParticles();
        }

        // Démarrage
        console.log("S.R.TRACK — moteur chargé");
        animate();
    });
})();
