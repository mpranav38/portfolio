/* ==========================================================================
   CONSOLIDATED HIGH-PERFORMANCE THREE.JS ECOSYSTEM MODULE
   ========================================================================== */
window.threeEcosystem = (function() {
  let globeScene, globeCamera, globeRenderer, globePoints;
  let warpScene, warpCamera, warpRenderer, warpStars;
  let skillScene, skillCamera, skillRenderer, skillGroup;
  
  const projectPipelines = {};
  const localIsMob = window.isMob || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

  function initAll() {
    initGlobePhoto();
    initWarpTunnel();
    initSkillConstellation();
    initProjectCards();
    animateLoop();
  }

  /* ── STEP 1: INTERACTIVE 3D PHOTO CYBER-GLOBE ── */
  function initGlobePhoto() {
    const container = document.getElementById('three-globe-photo-container');
    if (!container) return;
    
    globeScene = new THREE.Scene();
    globeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    globeCamera.position.z = 22;

    globeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    globeRenderer.setSize(container.clientWidth, container.clientHeight);
    globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(globeRenderer.domElement);

    const geo = new THREE.SphereGeometry(6, 32, 32);
    const pos = geo.attributes.position;
    const count = pos.count;
    
    // Convert to random code injection arrays to simulate cascading inward sequence
    const initPositions = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) { initPositions[i] = (Math.random() - 0.5) * 80; }
    geo.setAttribute('initPos', new THREE.BufferAttribute(initPositions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: localIsMob ? 0.08 : 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    globePoints = new THREE.Points(geo, mat);
    globeScene.add(globePoints);

    // Track cursor offset bounding parameters across photo card frame coordinates
    window.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        globePoints.rotation.y = mx * 0.4;
        globePoints.rotation.x = -my * 0.4;
      }
    });
  }

  /* ── STEP 3: 3D CINEMATIC SCROLL STAR TUNNEL ── */
  function initWarpTunnel() {
    const container = document.getElementById('three-warp-container');
    if (!container) return;

    warpScene = new THREE.Scene();
    warpCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    warpCamera.position.z = 0;

    warpRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    warpRenderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(warpRenderer.domElement);

    const count = localIsMob ? 400 : 1200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      const radius = 5 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      pos[i] = Math.cos(theta) * radius;
      pos[i+1] = Math.sin(theta) * radius;
      pos[i+2] = (Math.random() - 0.5) * 800; // Deep Z axis corridor tunnel mapping array
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x9b6dff,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    warpStars = new THREE.Points(geo, mat);
    warpScene.add(warpStars);

    window.addEventListener('resize', () => {
      warpCamera.aspect = window.innerWidth / window.innerHeight;
      warpCamera.updateProjectionMatrix();
      warpRenderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
  }

  /* ── STEP 2: 3D INTERACTIVE SKILL CONSTELLATION ── */
  function initSkillConstellation() {
    const container = document.getElementById('three-skills-constellation-container');
    if (!container) return;

    skillScene = new THREE.Scene();
    skillCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    skillCamera.position.z = 25;

    skillRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    skillRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(skillRenderer.domElement);

    skillGroup = new THREE.Group();
    skillScene.add(skillGroup);

    const skills = ['ML', 'DL', 'RAG', 'LLMs', 'Ops', 'Data'];
    const nodeCount = skills.length;
    const points = [];

    // Map skills nodes onto coordinates distributed across 3D vector paths
    for (let i = 0; i < nodeCount; i++) {
      const ang = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(ang) * 6;
      const y = Math.sin(ang) * 6;
      const z = (Math.random() - 0.5) * 3;
      points.push(new THREE.Vector3(x, y, z));

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x00ff9f, wireframe: true })
      );
      mesh.position.set(x, y, z);
      skillGroup.add(mesh);
    }

    // Connect floating node maps using light pipeline strings
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x6c2fff, transparent: true, opacity: 0.35 });
    const constellationLines = new THREE.LineLoop(lineGeo, lineMat);
    skillGroup.add(constellationLines);
  }

  /* ── STEP 4: INTERACTIVE 3D PROJECT CARD PREVIEWS ── */
  function initProjectCards() {
    setupSingleProject('three-proj-gitops', 0x00e5ff, 'cubeGraph');
    setupSingleProject('three-proj-devsecops', 0xff3cac, 'shieldBlocks');
    setupSingleProject('three-proj-auth', 0x00ff9f, 'abstractEye');
  }

  function setupSingleProject(id, coreColor, type) {
    const container = document.getElementById(id);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    let activeMesh;

    if (type === 'cubeGraph') {
      // 3D Animated time-series mesh floating inside index block matrix
      const group = new THREE.Group();
      const wireCube = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), new THREE.MeshBasicMaterial({ color: coreColor, wireframe: true, transparent:true, opacity:0.25 }));
      group.add(wireCube);

      const points = [];
      for(let i=0; i<10; i++) { points.push(new THREE.Vector3((i*0.3)-1.3, Math.sin(i*0.8)*1, (Math.random()-0.5)*1)); }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
// Changed 'strokeWidth:2' to 'linewidth:1' to match Three.js parameters perfectly
const graphLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x9b6dff, linewidth: 1 }));
group.add(graphLine);
      activeMesh = group;
    } 
    else if (type === 'shieldBlocks') {
      // rotating translucent data blocks shield configuration mapping
      const group = new THREE.Group();
      for(let i=0; i<3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5 + (i*0.4), 0.05, 8, 24), new THREE.MeshBasicMaterial({ color: coreColor, wireframe: true }));
        ring.rotation.x = Math.random() * Math.PI;
        group.add(ring);
      }
      activeMesh = group;
    } 
    else if (type === 'abstractEye') {
      // Vertex line framework tracking abstract structural matrix patterns
      activeMesh = new THREE.Mesh(new THREE.OctahedronGeometry(2, 1), new THREE.MeshBasicMaterial({ color: coreColor, wireframe: true }));
    }

    scene.add(activeMesh);
    projectPipelines[id] = { scene, camera, renderer, mesh: activeMesh, hoverMultiplier: 1.0 };

    // Hover acceleration parameters integration hooks
    const cardParent = container.closest('.proj-card');
    if (cardParent) {
      cardParent.addEventListener('mouseenter', () => projectPipelines[id].hoverMultiplier = 4.0);
      cardParent.addEventListener('mouseleave', () => projectPipelines[id].hoverMultiplier = 1.0);
    }
  }

  /* ── GLOBAL PHYSICS UNIFIED ANIMATION FRAME LOOP ── */
  let elapsed = 0;
  function animateLoop() {
    requestAnimationFrame(animateLoop);
    elapsed += 0.016;

    // 1. Globe Frame Matrix Transformations
    if (globePoints) {
      const pos = globePoints.geometry.attributes.position;
      const initPos = globePoints.geometry.attributes.initPos.array;
      const count = pos.count;
      
      // Interpolate coordinates seamlessly from deep space into structure layout coordinates
      const t = Math.min(elapsed * 0.35, 1.0);
      for (let i = 0; i < count * 3; i++) {
        pos.array[i] = THREE.MathUtils.lerp(initPos[i], pos.array[i], t);
      }
      pos.needsUpdate = true;
      if (t >= 1.0) { globePoints.rotation.y += 0.0015; }
    }

    // 3. Scroll Mapping camera updates onto Warp space coordinates
    if (warpStars && warpRenderer) {
      const scrollY = window.scrollY;
      // Map view offset parameter targets down Z path corridor arrays
      warpStars.position.z = (scrollY * 0.05) % 400;
      warpStars.rotation.z += 0.0006;
      warpRenderer.render(warpScene, warpCamera);
    }

    // 2. Skill orbital adjustments
    if (skillGroup && skillRenderer) {
      skillGroup.rotation.y += 0.003;
      skillGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.15;
      skillRenderer.render(skillScene, skillCamera);
    }

    // 4. Project Asset renders looping
    for (const id in projectPipelines) {
      const pipe = projectPipelines[id];
      pipe.mesh.rotation.y += 0.006 * pipe.hoverMultiplier;
      pipe.mesh.rotation.x += 0.003 * pipe.hoverMultiplier;
      pipe.renderer.render(pipe.scene, pipe.camera);
    }

    if (globeRenderer && globeScene && globeCamera) {
      globeRenderer.render(globeScene, globeCamera);
    }
  }

  return { init: initAll };
})();