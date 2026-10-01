```javascript
(() => {
    "use strict";

    // =====================================================
    // VERIFICATION THREE.JS
    // =====================================================

    if (typeof THREE === "undefined") {
        console.error("Three.js n'est pas chargé.");
        return;
    }

    const canvas = document.getElementById("scene");

    if (!canvas) {
        console.error("Canvas #scene introuvable.");
        return;
    }

    // =====================================================
    // SCENE
    // =====================================================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x05080c);

    scene.fog = new THREE.Fog(
        0x05080c,
        30,
        120
    );

    // =====================================================
    // CAMERA
    // =====================================================

    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        300
    );

    camera.position.set(
        0,
        5,
        28
    );

    // =====================================================
    // RENDERER
    // =====================================================

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.1;

    // =====================================================
    // LUMIERES
    // =====================================================

    const ambient = new THREE.AmbientLight(
        0xffffff,
        1.2
    );

    scene.add(ambient);

    const mainLight =
        new THREE.DirectionalLight(
            0xbfdcff,
            2
        );

    mainLight.position.set(
        -20,
        30,
        20
    );

    mainLight.castShadow = true;

    scene.add(mainLight);

    const warmLight =
        new THREE.PointLight(
            0xffb84d,
            4,
            35
        );

    warmLight.position.set(
        10,
        8,
        5
    );

    scene.add(warmLight);

    // =====================================================
    // GROUPE PRINCIPAL
    // =====================================================

    const world = new THREE.Group();

    scene.add(world);

    // =====================================================
    // SOL
    // =====================================================

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(
            180,
            180
        ),
        new THREE.MeshStandardMaterial({
            color: 0x11161b,
            roughness: 0.9
        })
    );

    ground.rotation.x =
        -Math.PI / 2;

    ground.position.y = 0;

    ground.receiveShadow = true;

    world.add(ground);

    // =====================================================
    // ROUTE
    // =====================================================

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(
            24,
            150
        ),
        new THREE.MeshStandardMaterial({
            color: 0x181c21,
            roughness: 0.95
        })
    );

    road.rotation.x =
        -Math.PI / 2;

    road.position.y = 0.02;

    road.position.z = -20;

    world.add(road);

    // =====================================================
    // LIGNES ROUTE
    // =====================================================

    for (
        let z = -80;
        z < 70;
        z += 8
    ) {

        const line = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.03,
                4
            ),
            new THREE.MeshBasicMaterial({
                color: 0xd9a447
            })
        );

        line.position.set(
            0,
            0.05,
            z
        );

        world.add(line);
    }

    // =====================================================
    // MATERIAUX
    // =====================================================

    const buildingMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x292f35,
            roughness: 0.75
        });

    const darkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x090d11,
            roughness: 0.4,
            metalness: 0.7
        });

    const glassMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x17303c,
            roughness: 0.2,
            metalness: 0.3
        });

    const whiteMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xe1e4e6,
            roughness: 0.45
        });

    // =====================================================
    // BATIMENT SR TRACK
    // =====================================================

    const building =
        new THREE.Group();

    building.position.set(
        -22,
        7,
        -25
    );

    world.add(building);

    const buildingBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                25,
                14,
                30
            ),
            buildingMaterial
        );

    buildingBody.castShadow = true;
    buildingBody.receiveShadow = true;

    building.add(buildingBody);

    // =====================================================
    // FENETRES
    // =====================================================

    for (
        let row = 0;
        row < 4;
        row++
    ) {

        for (
            let col = 0;
            col < 6;
            col++
        ) {

            const window =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        2.5,
                        1.8,
                        0.12
                    ),
                    glassMaterial
                );

            window.position.set(
                -6.5 + col * 2.6,
                -4 + row * 2.8,
                15.1
            );

            building.add(window);
        }
    }

    // =====================================================
    // ATELIER
    // =====================================================

    const workshop =
        new THREE.Group();

    workshop.position.set(
        22,
        5,
        -28
    );

    world.add(workshop);

    const workshopBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                24,
                10,
                28
            ),
            new THREE.MeshStandardMaterial({
                color: 0x343a40,
                roughness: 0.8
            })
        );

    workshopBody.castShadow = true;

    workshop.add(workshopBody);

    // =====================================================
    // FONCTION FOURGON
    // =====================================================

    function createVan(color) {

        const van =
            new THREE.Group();

        // carrosserie

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4.2,
                    2.2,
                    7.5
                ),
                new THREE.MeshStandardMaterial({
                    color: color,
                    roughness: 0.4,
                    metalness: 0.2
                })
            );

        body.position.y = 1.4;

        body.castShadow = true;

        van.add(body);

        // cabine

        const cabin =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    1.7,
                    2.5
                ),
                glassMaterial
            );

        cabin.position.set(
            0,
            2.5,
            2
        );

        van.add(cabin);

        // roues

        const wheelGeometry =
            new THREE.CylinderGeometry(
                0.7,
                0.7,
                0.45,
                20
            );

        const wheelPositions = [
            [-2.1, 0.7, 2.3],
            [2.1, 0.7, 2.3],
            [-2.1, 0.7, -2.3],
            [2.1, 0.7, -2.3]
        ];

        wheelPositions.forEach(
            position => {

                const wheel =
                    new THREE.Mesh(
                        wheelGeometry,
                        darkMaterial
                    );

                wheel.rotation.z =
                    Math.PI / 2;

                wheel.position.set(
                    position[0],
                    position[1],
                    position[2]
                );

                wheel.castShadow = true;

                van.add(wheel);
            }
        );

        // antenne GPS

        const antenna =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.04,
                    0.04,
                    0.5,
                    8
                ),
                darkMaterial
            );

        antenna.position.set(
            0,
            3,
            -0.5
        );

        van.add(antenna);

        // GPS

        const gps =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.12,
                    12,
                    12
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x35d5ef
                })
            );

        gps.position.set(
            0,
            3.3,
            -0.5
        );

        van.add(gps);

        return van;
    }

    // =====================================================
    // VEHICULES
    // =====================================================

    const van1 =
        createVan(0xe1e4e6);

    van1.position.set(
        0,
        0,
        15
    );

    world.add(van1);

    const van2 =
        createVan(0xcbd0d3);

    van2.position.set(
        -7,
        0,
        -10
    );

    world.add(van2);

    const van3 =
        createVan(0xd6dadd);

    van3.position.set(
        7,
        0,
        -35
    );

    world.add(van3);

    // =====================================================
    // SCROLL
    // =====================================================

    const textSections =
        document.querySelectorAll(
            ".scene-text"
        );

    const progress =
        document.getElementById(
            "progress"
        );

    let scrollProgress = 0;

    // Cette fonction est maintenant appelée
    // DIRECTEMENT pendant le scroll.

    function updateScroll() {

        const maxScroll =
            document.documentElement.scrollHeight -
            window.innerHeight;

        if (maxScroll <= 0) {
            scrollProgress = 0;
        } else {

            scrollProgress =
                window.scrollY / maxScroll;
        }

        scrollProgress =
            Math.max(
                0,
                Math.min(
                    1,
                    scrollProgress
                )
            );

        // barre

        if (progress) {

            progress.style.width =
                (
                    scrollProgress * 100
                ) + "%";
        }

        // textes

        textSections.forEach(
            section => {

                const start =
                    parseFloat(
                        section.dataset.start
                    );

                const end =
                    parseFloat(
                        section.dataset.end
                    );

                if (
                    scrollProgress >= start &&
                    scrollProgress <= end
                ) {

                    section.classList.add(
                        "active"
                    );

                } else {

                    section.classList.remove(
                        "active"
                    );
                }
            }
        );
    }

    window.addEventListener(
        "scroll",
        updateScroll,
        {
            passive: true
        }
    );

    // =====================================================
    // CAMERA
    // =====================================================

    function updateCamera() {

        let targetX;
        let targetY;
        let targetZ;

        // INTRO

        if (scrollProgress < 0.09) {

            targetX = 0;
            targetY = 5;
            targetZ = 28;
        }

        // ENTREPRISE

        else if (
            scrollProgress < 0.22
        ) {

            targetX = -10;
            targetY = 6;
            targetZ = 22;
        }

        // FLOTTE

        else if (
            scrollProgress < 0.37
        ) {

            targetX = 0;
            targetY = 5;
            targetZ = 15;
        }

        // ATELIER

        else if (
            scrollProgress < 0.53
        ) {

            targetX = 17;
            targetY = 6;
            targetZ = 13;
        }

        // LOGICIEL

        else if (
            scrollProgress < 0.70
        ) {

            targetX = -17;
            targetY = 8;
            targetZ = 10;
        }

        // CYBERSECURITE

        else if (
            scrollProgress < 0.86
        ) {

            targetX = -22;
            targetY = 6;
            targetZ = 10;
        }

        // FIN

        else {

            targetX = 0;
            targetY = 7;
            targetZ = 28;
        }

        camera.position.x +=
            (
                targetX -
                camera.position.x
            ) * 0.045;

        camera.position.y +=
            (
                targetY -
                camera.position.y
            ) * 0.045;

        camera.position.z +=
            (
                targetZ -
                camera.position.z
            ) * 0.045;

        camera.lookAt(
            0,
            3,
            -15
        );
    }

    // =====================================================
    // ANIMATION
    // =====================================================

    function animate() {

        requestAnimationFrame(
            animate
        );

        // mouvement léger des véhicules

        van1.position.z -= 0.025;

        if (van1.position.z < -60) {
            van1.position.z = 50;
        }

        van2.position.z += 0.018;

        if (van2.position.z > 50) {
            van2.position.z = -60;
        }

        van3.position.z -= 0.02;

        if (van3.position.z < -60) {
            van3.position.z = 50;
        }

        updateCamera();

        renderer.render(
            scene,
            camera
        );
    }

    // =====================================================
    // RESIZE
    // =====================================================

    window.addEventListener(
        "resize",
        () => {

            camera.aspect =
                window.innerWidth /
                window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio,
                    2
                )
            );
        }
    );

    // =====================================================
    // DEMARRAGE
    // =====================================================

    updateScroll();

    animate();

})();
```
