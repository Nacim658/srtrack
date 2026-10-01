(() => {
    "use strict";

    // =========================================================
    // S.R.TRACK
    // Scène 3D interactive avec Three.js
    // =========================================================

    const canvas = document.getElementById("scene");
    const progressBar = document.getElementById("progress");
    const sections = document.querySelectorAll(".scene-text");

    if (!canvas || !window.THREE) {
        console.error("Three.js ou le canvas #scene est introuvable.");
        return;
    }

    const THREE = window.THREE;

    // ---------------------------------------------------------
    // SCÈNE
    // ---------------------------------------------------------

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x05080c);

    scene.fog = new THREE.FogExp2(
        0x05080c,
        0.018
    );


    // ---------------------------------------------------------
    // CAMERA
    // ---------------------------------------------------------

    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );

    camera.position.set(
        0,
        4,
        24
    );


    // ---------------------------------------------------------
    // RENDERER
    // ---------------------------------------------------------

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;


    // ---------------------------------------------------------
    // LUMIÈRES
    // ---------------------------------------------------------

    const ambientLight =
        new THREE.HemisphereLight(
            0x8fa4bd,
            0x080a0e,
            1.2
        );

    scene.add(ambientLight);


    const moonLight =
        new THREE.DirectionalLight(
            0xb7d3ff,
            2.0
        );

    moonLight.position.set(
        -20,
        30,
        20
    );

    moonLight.castShadow = true;

    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;

    moonLight.shadow.camera.left = -60;
    moonLight.shadow.camera.right = 60;
    moonLight.shadow.camera.top = 60;
    moonLight.shadow.camera.bottom = -60;

    scene.add(moonLight);


    // ---------------------------------------------------------
    // GROUPES PRINCIPAUX
    // ---------------------------------------------------------

    const world = new THREE.Group();

    scene.add(world);


    const vehicles = [];
    const people = [];
    const gpsSignals = [];
    const screens = [];
    const streetLights = [];


    // =========================================================
    // MATÉRIAUX
    // =========================================================

    const asphaltMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x11161c,
            roughness: 0.9,
            metalness: 0.05
        });


    const concreteMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4a5056,
            roughness: 0.8
        });


    const buildingMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x252b31,
            roughness: 0.65,
            metalness: 0.15
        });


    const darkMetal =
        new THREE.MeshStandardMaterial({
            color: 0x11151a,
            roughness: 0.35,
            metalness: 0.7
        });


    const glassMaterial =
        new THREE.MeshPhysicalMaterial({
            color: 0x122431,
            roughness: 0.1,
            metalness: 0.2,
            transmission: 0.15,
            transparent: true,
            opacity: 0.75
        });


    const whiteVehicle =
        new THREE.MeshStandardMaterial({
            color: 0xe4e7e8,
            roughness: 0.45,
            metalness: 0.2
        });


    const blackMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x090c10,
            roughness: 0.35,
            metalness: 0.6
        });


    const goldMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd59b3e,
            roughness: 0.35,
            metalness: 0.6
        });


    const cyanMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x35d5ef
        });


    const greenMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x52dc91
        });


    const redMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff5263
        });


    // =========================================================
    // SOL
    // =========================================================

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(
            180,
            180
        ),
        asphaltMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;

    ground.receiveShadow = true;

    world.add(ground);


    // =========================================================
    // ROUTE
    // =========================================================

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(
            30,
            150
        ),
        new THREE.MeshStandardMaterial({
            color: 0x181d22,
            roughness: 0.95
        })
    );

    road.rotation.x = -Math.PI / 2;

    road.position.y = 0.01;
    road.position.z = -20;

    world.add(road);


    // ---------------------------------------------------------
    // LIGNES DE ROUTE
    // ---------------------------------------------------------

    for (let z = -90; z < 70; z += 8) {

        const line = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.025,
                4
            ),
            goldMaterial
        );

        line.position.set(
            0,
            0.04,
            z
        );

        world.add(line);
    }


    // =========================================================
    // BÂTIMENT S.R.TRACK
    // =========================================================

    const building = new THREE.Group();

    building.position.set(
        -22,
        7,
        -25
    );

    world.add(building);


    const buildingBody = new THREE.Mesh(
        new THREE.BoxGeometry(
            25,
            14,
            32
        ),
        buildingMaterial
    );

    buildingBody.castShadow = true;
    buildingBody.receiveShadow = true;

    building.add(buildingBody);


    // ---------------------------------------------------------
    // FAÇADE VITRÉE
    // ---------------------------------------------------------

    for (let y = 0; y < 5; y++) {

        for (let x = 0; x < 6; x++) {

            const window = new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.7,
                    1.8,
                    0.08
                ),
                glassMaterial
            );

            window.position.set(
                -6.7 + x * 2.7,
                -4.8 + y * 2.5,
                16.05
            );

            building.add(window);


            const interiorLight =
                new THREE.PointLight(
                    0x77b8d6,
                    0.18,
                    5
                );

            interiorLight.position.copy(
                window.position
            );

            interiorLight.position.z -= 1;

            building.add(interiorLight);
        }
    }


    // ---------------------------------------------------------
    // ENSEIGNE
    // ---------------------------------------------------------

    const sign = new THREE.Mesh(
        new THREE.BoxGeometry(
            12,
            2.4,
            0.25
        ),
        blackMaterial
    );

    sign.position.set(
        0,
        6,
        16.25
    );

    building.add(sign);


    // =========================================================
    // ATELIER
    // =========================================================

    const workshop = new THREE.Group();

    workshop.position.set(
        22,
        5,
        -28
    );

    world.add(workshop);


    const workshopBuilding = new THREE.Mesh(
        new THREE.BoxGeometry(
            25,
            10,
            28
        ),
        new THREE.MeshStandardMaterial({
            color: 0x30363c,
            roughness: 0.75
        })
    );

    workshopBuilding.castShadow = true;
    workshopBuilding.receiveShadow = true;

    workshop.add(workshopBuilding);


    // ---------------------------------------------------------
    // PORTES D'ATELIER
    // ---------------------------------------------------------

    for (let i = 0; i < 2; i++) {

        const door = new THREE.Mesh(
            new THREE.BoxGeometry(
                8,
                6.5,
                0.15
            ),
            darkMetal
        );

        door.position.set(
            -6 + i * 12,
            -1.5,
            14.1
        );

        workshop.add(door);


        const doorLight =
            new THREE.PointLight(
                0xe5ad50,
                0.7,
                9
            );

        doorLight.position.set(
            door.position.x,
            2,
            door.position.z + 1
        );

        workshop.add(doorLight);
    }


    // =========================================================
    // FONCTION POUR CRÉER UNE FOURGONNETTE
    // =========================================================

    function createVan(color = 0xe4e7e8) {

        const van = new THREE.Group();

        // -----------------------------------------------------
        // CARROSSERIE
        // -----------------------------------------------------

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(
                4.2,
                2.2,
                8
            ),
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.42,
                metalness: 0.25
            })
        );

        body.position.y = 1.55;

        body.castShadow = true;
        body.receiveShadow = true;

        van.add(body);


        // -----------------------------------------------------
        // CABINE
        // -----------------------------------------------------

        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(
                4.05,
                1.8,
                2.8
            ),
            glassMaterial
        );

        cabin.position.set(
            0,
            2.6,
            2.1
        );

        van.add(cabin);


        // -----------------------------------------------------
        // TOIT
        // -----------------------------------------------------

        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(
                4.05,
                0.18,
                6.5
            ),
            whiteVehicle
        );

        roof.position.set(
            0,
            2.75,
            -0.3
        );

        van.add(roof);


        // -----------------------------------------------------
        // PARE-CHOCS
        // -----------------------------------------------------

        const bumperFront = new THREE.Mesh(
            new THREE.BoxGeometry(
                4.25,
                0.4,
                0.3
            ),
            darkMetal
        );

        bumperFront.position.set(
            0,
            0.75,
            4.05
        );

        van.add(bumperFront);


        // -----------------------------------------------------
        // ROUES
        // -----------------------------------------------------

        const wheelGeometry =
            new THREE.CylinderGeometry(
                0.75,
                0.75,
                0.45,
                24
            );

        const wheelPositions = [
            [-2.15, 0.75, 2.5],
            [2.15, 0.75, 2.5],
            [-2.15, 0.75, -2.5],
            [2.15, 0.75, -2.5]
        ];

        wheelPositions.forEach(pos => {

            const wheel = new THREE.Mesh(
                wheelGeometry,
                blackMaterial
            );

            wheel.rotation.z =
                Math.PI / 2;

            wheel.position.set(
                pos[0],
                pos[1],
                pos[2]
            );

            wheel.castShadow = true;

            van.add(wheel);
        });


        // -----------------------------------------------------
        // PHARES
        // -----------------------------------------------------

        const headlightGeometry =
            new THREE.BoxGeometry(
                0.7,
                0.3,
                0.12
            );

        [-1.35, 1.35].forEach(x => {

            const light = new THREE.Mesh(
                headlightGeometry,
                new THREE.MeshBasicMaterial({
                    color: 0xdff8ff
                })
            );

            light.position.set(
                x,
                1.65,
                4.1
            );

            van.add(light);
        });


        // -----------------------------------------------------
        // FEUX ARRIÈRE
        // -----------------------------------------------------

        [-1.35, 1.35].forEach(x => {

            const light = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.55,
                    0.3,
                    0.12
                ),
                redMaterial
            );

            light.position.set(
                x,
                1.55,
                -4.1
            );

            van.add(light);
        });


        // -----------------------------------------------------
        // ANTENNE GPS
        // -----------------------------------------------------

        const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.04,
                0.04,
                0.55,
                8
            ),
            darkMetal
        );

        antenna.position.set(
            0,
            3.1,
            -0.5
        );

        van.add(antenna);


        const gps = new THREE.Mesh(
            new THREE.SphereGeometry(
                0.12,
                12,
                12
            ),
            cyanMaterial
        );

        gps.position.set(
            0,
            3.42,
            -0.5
        );

        van.add(gps);


        // -----------------------------------------------------
        // LOGO LATÉRAL
        // -----------------------------------------------------

        const logoStripe = new THREE.Mesh(
            new THREE.BoxGeometry(
                4.25,
                0.18,
                5.2
            ),
            goldMaterial
        );

        logoStripe.position.set(
            0,
            1.55,
            -0.2
        );

        van.add(logoStripe);


        return van;
    }


    // =========================================================
    // CRÉATION DE PLUSIEURS FOURGONS
    // =========================================================

    const van1 = createVan();
    van1.position.set(
        0,
        0,
        15
    );

    van1.rotation.y = Math.PI;

    world.add(van1);

    vehicles.push({
        object: van1,
        speed: 0.035,
        start: 15
    });


    const van2 = createVan(0xcfd4d7);

    van2.position.set(
        -7,
        0,
        -10
    );

    van2.rotation.y = Math.PI;

    world.add(van2);

    vehicles.push({
        object: van2,
        speed: 0.025,
        start: -10
    });


    const van3 = createVan(0xd9dde0);

    van3.position.set(
        7,
        0,
        -35
    );

    world.add(van3);

    vehicles.push({
        object: van3,
        speed: 0.03,
        start: -35
    });


    // =========================================================
    // PERSONNE
    // =========================================================

    function createPerson(x, y, z) {

        const person = new THREE.Group();

        // corps

        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.32,
                0.4,
                1.4,
                10
            ),
            new THREE.MeshStandardMaterial({
                color: 0x26313b,
                roughness: 0.9
            })
        );

        body.position.y = 1.05;

        body.castShadow = true;

        person.add(body);


        // tête

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(
                0.32,
                16,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xb97855,
                roughness: 0.8
            })
        );

        head.position.y = 2.05;

        head.castShadow = true;

        person.add(head);


        // jambes

        for (let i = -1; i <= 1; i += 2) {

            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.12,
                    0.14,
                    1.1,
                    8
                ),
                darkMetal
            );

            leg.position.set(
                i * 0.16,
                0.25,
                0
            );

            leg.castShadow = true;

            person.add(leg);
        }


        // bras

        for (let i = -1; i <= 1; i += 2) {

            const arm = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.09,
                    0.11,
                    1.0,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x35414d
                })
            );

            arm.position.set(
                i * 0.42,
                1.1,
                0
            );

            arm.rotation.z =
                i * 0.2;

            person.add(arm);
        }


        person.position.set(
            x,
            y,
            z
        );

        world.add(person);

        people.push({
            object: person,
            baseY: y,
            phase: Math.random() * Math.PI * 2
        });

        return person;
    }


    // =========================================================
    // TECHNICIENS DANS L'ATELIER
    // =========================================================

    createPerson(
        18,
        0,
        -17
    );

    createPerson(
        27,
        0,
        -17
    );

    createPerson(
        23,
        0,
        -31
    );

    createPerson(
        15,
        0,
        -31
    );


    // =========================================================
    // ÉQUIPE CYBERSÉCURITÉ
    // =========================================================

    const securityRoom =
        new THREE.Group();

    securityRoom.position.set(
        -21,
        4,
        -10
    );

    world.add(securityRoom);


    const desk = new THREE.Mesh(
        new THREE.BoxGeometry(
            8,
            0.5,
            2.5
        ),
        darkMetal
    );

    desk.position.y = 2;

    securityRoom.add(desk);


    // écrans

    for (let i = 0; i < 4; i++) {

        const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(
                1.7,
                1.15,
                0.1
            ),
            blackMaterial
        );

        monitor.position.set(
            -3.0 + i * 2,
            3.1,
            -0.3
        );

        securityRoom.add(monitor);


        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.45,
                0.85
            ),
            new THREE.MeshBasicMaterial({
                color:
                    i % 2 === 0
                        ? 0x163c48
                        : 0x173d2c
            })
        );

        screen.position.set(
            monitor.position.x,
            monitor.position.y,
            monitor.position.z + 0.06
        );

        securityRoom.add(screen);

        screens.push(screen);
    }


    createPerson(
        -24,
        0,
        -8
    );

    createPerson(
        -18,
        0,
        -8
    );


    // =========================================================
    // SIGNALS GPS
    // =========================================================

    function createGpsSignal(position) {

        const group =
            new THREE.Group();

        const ringGeometry =
            new THREE.RingGeometry(
                0.2,
                0.25,
                32
            );

        for (let i = 0; i < 3; i++) {

            const ring = new THREE.Mesh(
                ringGeometry,
                new THREE.MeshBasicMaterial({
                    color: 0x35d5ef,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide
                })
            );

            ring.rotation.x =
                -Math.PI / 2;

            ring.position.y =
                3.3 + i * 0.05;

            ring.scale.setScalar(
                1 + i * 0.4
            );

            group.add(ring);
        }

        group.position.copy(
            position
        );

        world.add(group);

        gpsSignals.push({
            object: group,
            phase: Math.random() * Math.PI * 2
        });
    }


    createGpsSignal(
        new THREE.Vector3(
            0,
            0,
            15
        )
    );

    createGpsSignal(
        new THREE.Vector3(
            -7,
            0,
            -10
        )
    );

    createGpsSignal(
        new THREE.Vector3(
            7,
            0,
            -35
        )
    );


    // =========================================================
    // LAMPADAIRES
    // =========================================================

    function createStreetLight(x, z) {

        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.08,
                0.12,
                6,
                10
            ),
            darkMetal
        );

        pole.position.set(
            x,
            3,
            z
        );

        pole.castShadow = true;

        world.add(pole);


        const lamp = new THREE.Mesh(
            new THREE.SphereGeometry(
                0.18,
                12,
                12
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffd98c
            })
        );

        lamp.position.set(
            x,
            6,
            z
        );

        world.add(lamp);


        const light =
            new THREE.PointLight(
                0xffc875,
                1.4,
                13
            );

        light.position.set(
            x,
            6,
            z
        );

        world.add(light);

        streetLights.push(light);
    }


    createStreetLight(-11, 8);
    createStreetLight(11, 8);
    createStreetLight(-11, -15);
    createStreetLight(11, -15);
    createStreetLight(-11, -40);
    createStreetLight(11, -40);


    // =========================================================
    // PARTICULES
    // =========================================================

    const particleCount = 700;

    const particlePositions =
        new Float32Array(
            particleCount * 3
        );

    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        particlePositions[i * 3] =
            (Math.random() - 0.5) * 150;

        particlePositions[i * 3 + 1] =
            Math.random() * 45;

        particlePositions[i * 3 + 2] =
            (Math.random() - 0.5) * 150;
    }


    const particleGeometry =
        new THREE.BufferGeometry();

    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            particlePositions,
            3
        )
    );


    const particleMaterial =
        new THREE.PointsMaterial({
            color: 0x8294a5,
            size: 0.045,
            transparent: true,
            opacity: 0.45
        });


    const particles =
        new THREE.Points(
            particleGeometry,
            particleMaterial
        );

    world.add(particles);


    // =========================================================
    // ANIMATION DU SCROLL
    // =========================================================

    let scrollProgress = 0;

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
            THREE.MathUtils.clamp(
                scrollProgress,
                0,
                1
            );


        // barre supérieure

        if (progressBar) {

            progressBar.style.width =
                `${scrollProgress * 100}%`;
        }


        // texte

        sections.forEach(section => {

            const start =
                parseFloat(
                    section.dataset.start || 0
                );

            const end =
                parseFloat(
                    section.dataset.end || 1
                );

            const active =
                scrollProgress >= start &&
                scrollProgress <= end;

            section.classList.toggle(
                "active",
                active
            );
        });
    }


    window.addEventListener(
        "scroll",
        updateScroll,
        {
            passive: true
        }
    );


    // =========================================================
    // ANIMATION CAMERA
    // =========================================================

    let targetCameraX = 0;
    let targetCameraY = 4;
    let targetCameraZ = 24;

    function updateCamera() {

        const p =
            scrollProgress;


        // Début
        if (p < 0.12) {

            targetCameraX = 0;
            targetCameraY = 5;
            targetCameraZ = 25;

        }

        // Entrée dans l'entreprise
        else if (p < 0.25) {

            targetCameraX = -12;
            targetCameraY = 5;
            targetCameraZ = 18;

        }

        // Flotte
        else if (p < 0.40) {

            targetCameraX = 0;
            targetCameraY = 4;
            targetCameraZ = 12;

        }

        // Atelier
        else if (p < 0.55) {

            targetCameraX = 17;
            targetCameraY = 5;
            targetCameraZ = 12;

        }

        // Logiciels
        else if (p < 0.72) {

            targetCameraX = -17;
            targetCameraY = 7;
            targetCameraZ = 8;

        }

        // Cybersécurité
        else if (p < 0.87) {

            targetCameraX = -22;
            targetCameraY = 5;
            targetCameraZ = 7;

        }

        // Fin
        else {

            targetCameraX = 0;
            targetCameraY = 7;
            targetCameraZ = 25;
        }


        camera.position.x +=
            (targetCameraX -
                camera.position.x) * 0.035;

        camera.position.y +=
            (targetCameraY -
                camera.position.y) * 0.035;

        camera.position.z +=
            (targetCameraZ -
                camera.position.z) * 0.035;


        // regarder vers le centre

        const lookTarget =
            new THREE.Vector3(
                0,
                3,
                -12
            );

        camera.lookAt(
            lookTarget
        );
    }


    // =========================================================
    // ANIMATION DES VÉHICULES
    // =========================================================

    function updateVehicles(time) {

        vehicles.forEach(
            (vehicle, index) => {

                const van =
                    vehicle.object;

                const direction =
                    index === 2
                        ? -1
                        : 1;

                van.position.z +=
                    vehicle.speed *
                    direction;


                if (van.position.z > 45) {

                    van.position.z = -60;
                }

                if (van.position.z < -60) {

                    van.position.z = 45;
                }
            }
        );
    }


    // =========================================================
    // ANIMATION DES PERSONNES
    // =========================================================

    function updatePeople(time) {

        people.forEach(person => {

            person.object.position.y =
                person.baseY +
                Math.sin(
                    time * 0.0015 +
                    person.phase
                ) * 0.025;

            person.object.rotation.y =
                Math.sin(
                    time * 0.0006 +
                    person.phase
                ) * 0.15;
        });
    }


    // =========================================================
    // ANIMATION GPS
    // =========================================================

    function updateGps(time) {

        gpsSignals.forEach(signal => {

            const pulse =
                1 +
                Math.sin(
                    time * 0.003 +
                    signal.phase
                ) * 0.25;

            signal.object.scale.setScalar(
                pulse
            );

            signal.object.children.forEach(
                (ring, index) => {

                    ring.material.opacity =
                        0.65 -
                        index * 0.15;
                }
            );
        });
    }


    // =========================================================
    // ANIMATION DES ÉCRANS
    // =========================================================

    function updateScreens(time) {

        screens.forEach(
            (screen, index) => {

                const pulse =
                    0.65 +
                    Math.sin(
                        time * 0.003 +
                        index
                    ) * 0.2;

                screen.material.opacity =
                    pulse;
            }
        );
    }


    // =========================================================
    // ANIMATION DES PARTICULES
    // =========================================================

    function updateParticles(time) {

        particles.rotation.y =
            time * 0.00001;

        particles.rotation.x =
            Math.sin(
                time * 0.00008
            ) * 0.04;
    }


    // =========================================================
    // RESPONSIVE
    // =========================================================

    function resize() {

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


    window.addEventListener(
        "resize",
        resize
    );


    // =========================================================
    // BOUCLE PRINCIPALE
    // =========================================================

    const clock =
        new THREE.Clock();


    function animate() {

        requestAnimationFrame(
            animate
        );

        const time =
            performance.now();


        updateScroll();

        updateCamera();

        updateVehicles(
            time
        );

        updatePeople(
            time
        );

        updateGps(
            time
        );

        updateScreens(
            time
        );

        updateParticles(
            time
        );


        renderer.render(
            scene,
            camera
        );
    }


    // =========================================================
    // DÉMARRAGE
    // =========================================================

    updateScroll();

    resize();

    animate();

})();
