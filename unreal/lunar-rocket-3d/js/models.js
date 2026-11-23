import * as THREE from 'three';

const shared = {};

// Procedural 304L Brushed Stainless Steel texture with Starship horizontal weld-rings
function makeStainlessSteelTexture(hasStarshipLogo = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base metallic gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#aeb6c2');
  grad.addColorStop(0.22, '#e2e8f0');
  grad.addColorStop(0.48, '#cbd5e1');
  grad.addColorStop(0.75, '#f1f5f9');
  grad.addColorStop(1, '#aeb6c2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Stacked barrel ring weld seams (iconic SpaceX Starship steel rings)
  const ringCount = 12;
  const ringH = 512 / ringCount;
  for (let i = 0; i < ringCount; i++) {
    const y = i * ringH;
    // Slight per-ring metallic sheen variation
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
    ctx.fillRect(0, y, 512, ringH);

    // Subtle weld seam line
    ctx.fillStyle = 'rgba(51, 65, 85, 0.32)';
    ctx.fillRect(0, y, 512, 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, y + 2, 512, 1);
  }

  // Fine horizontal brushed steel grain
  for (let i = 0; i < 600; i++) {
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(30,41,59,0.06)';
    ctx.fillRect(0, y, 512, 1);
  }

  // Black ceramic hexagonal heat-shield tiles on the belly half (x: 260..512)
  if (hasStarshipLogo) {
    // Windward heat-shield zone
    ctx.fillStyle = '#111827';
    ctx.fillRect(275, 0, 237, 512);

    // Subtle hexagonal/grid ceramic tile seams
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.lineWidth = 1;
    const step = 12;
    for (let y = 0; y < 512; y += step) {
      ctx.beginPath();
      ctx.moveTo(275, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    for (let x = 275; x < 512; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    // Subtle dark vertical SPACEX style stripe & insignia on stainless side
    ctx.save();
    ctx.translate(135, 256);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPACEX', 0, -18);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.fillRect(-46, -6, 92, 4);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('STARSHIP', 0, 14);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Soft volumetric cloud puff texture for realistic atmospheric mist/clouds
function makeCloudSpriteTexture() {
  if (shared.cloudTex) return shared.cloudTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Layered off-center soft radial puffs
  const puffs = [
    { x: 128, y: 128, r: 108, a: 0.55 },
    { x: 92, y: 120, r: 78, a: 0.45 },
    { x: 165, y: 124, r: 82, a: 0.45 },
    { x: 125, y: 95, r: 74, a: 0.4 },
    { x: 132, y: 152, r: 70, a: 0.3 },
  ];

  for (const p of puffs) {
    const grad = ctx.createRadialGradient(p.x, p.y, p.r * 0.08, p.x, p.y, p.r);
    grad.addColorStop(0, `rgba(255, 255, 255, ${p.a})`);
    grad.addColorStop(0.55, `rgba(226, 232, 240, ${p.a * 0.55})`);
    grad.addColorStop(1, 'rgba(226, 232, 240, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  shared.cloudTex = tex;
  return tex;
}

// Create a Starship aero flap (forward canard or aft flap)
function createStarshipFlap(width, height, isForward, steelMat, tileMat) {
  const shape = new THREE.Shape();
  if (isForward) {
    // Sleek angled triangular/trapezoidal forward canard flap
    shape.moveTo(0, 0);
    shape.lineTo(width, -height * 0.25);
    shape.lineTo(width * 0.72, -height * 0.92);
    shape.lineTo(0, -height);
  } else {
    // Iconic larger trapezoidal Starship aft flap
    shape.moveTo(0, 0);
    shape.lineTo(width, -height * 0.22);
    shape.lineTo(width * 0.92, -height * 0.95);
    shape.lineTo(0, -height);
  }
  shape.closePath();

  const extrudeSettings = {
    depth: 0.055,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.015,
    bevelSegments: 2,
  };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geo, tileMat);
  group.add(mesh);

  // Metallic hinge fairing along root edge
  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, height * 0.92, 8),
    steelMat
  );
  hinge.position.x = -width * 0.45;
  group.add(hinge);

  return group;
}

// Create a realistic titanium waffle Grid Fin for Super Heavy
function createGridFin(mat) {
  const group = new THREE.Group();
  const frameW = 0.48;
  const frameD = 0.34;
  const frameH = 0.06;

  // Outer frame
  const barX = new THREE.BoxGeometry(frameW, frameH, 0.035);
  const barZ = new THREE.BoxGeometry(0.035, frameH, frameD);

  [-frameD / 2, 0, frameD / 2].forEach((z) => {
    const b = new THREE.Mesh(barX, mat);
    b.position.z = z;
    group.add(b);
  });
  [-frameW / 2, -frameW / 6, frameW / 6, frameW / 2].forEach((x) => {
    const b = new THREE.Mesh(barZ, mat);
    b.position.x = x;
    group.add(b);
  });

  // Mounting actuator shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), mat);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = -frameW * 0.55;
  group.add(shaft);

  return group;
}

export function createRocket() {
  const root = new THREE.Group();

  const shipSteelTex = makeStainlessSteelTexture(true);
  const boosterSteelTex = makeStainlessSteelTexture(false);

  const shipSteelMat = new THREE.MeshStandardMaterial({
    map: shipSteelTex,
    roughness: 0.22,
    metalness: 0.88,
  });

  const boosterSteelMat = new THREE.MeshStandardMaterial({
    map: boosterSteelTex,
    roughness: 0.25,
    metalness: 0.86,
  });

  const pureSteelMat = new THREE.MeshStandardMaterial({
    color: 0xdbe3ec,
    roughness: 0.2,
    metalness: 0.9,
  });

  const heatTileMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.72,
    metalness: 0.22,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.75,
  });

  const engineBellMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.88,
  });

  // ==========================================================
  // STARSHIP UPPER STAGE (Ogive Nosecone + Body + 4 Flaps)
  // ==========================================================
  const shipGroup = new THREE.Group();
  shipGroup.position.y = 1.05;

  // 1. Curved Ogive Nosecone using LatheGeometry (authentic Starship profile!)
  const ogivePoints = [];
  const noseH = 1.35;
  const radius = 0.46;
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = base, 1 = rounded tip
    const y = t * noseH;
    // Smooth tangent ogive curve
    const r = radius * Math.pow(1 - Math.pow(t, 1.85), 0.58);
    ogivePoints.push(new THREE.Vector2(Math.max(0.004, r), y));
  }
  const noseGeo = new THREE.LatheGeometry(ogivePoints, 28);
  const noseMesh = new THREE.Mesh(noseGeo, shipSteelMat);
  noseMesh.position.y = 0.75;
  noseMesh.rotation.y = Math.PI * 0.42; // Show stainless steel + glimpse of black heat-shield edge
  shipGroup.add(noseMesh);

  // 2. Starship cylindrical stainless steel hull
  const shipBody = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 1.55, 28),
    shipSteelMat
  );
  shipBody.position.y = -0.02;
  shipBody.rotation.y = Math.PI * 0.42;
  shipGroup.add(shipBody);

  // Subtle dark viewport/sensor strip near upper cabin
  const cabinStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.08, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.9,
    })
  );
  cabinStrip.position.set(0, 1.02, 0.37);
  shipGroup.add(cabinStrip);

  // 3. Forward Canard Flaps (Left & Right near nosecone)
  const fwdFlapL = createStarshipFlap(0.46, 0.72, true, pureSteelMat, heatTileMat);
  fwdFlapL.position.set(-0.56, 1.08, -0.04);
  fwdFlapL.scale.x = -1;
  fwdFlapL.rotation.y = 0.12;
  shipGroup.add(fwdFlapL);

  const fwdFlapR = createStarshipFlap(0.46, 0.72, true, pureSteelMat, heatTileMat);
  fwdFlapR.position.set(0.56, 1.08, -0.04);
  fwdFlapR.rotation.y = -0.12;
  shipGroup.add(fwdFlapR);

  // 4. Aft Aero Flaps (Left & Right at Starship base)
  const aftFlapL = createStarshipFlap(0.62, 1.02, false, pureSteelMat, heatTileMat);
  aftFlapL.position.set(-0.68, -0.32, -0.04);
  aftFlapL.scale.x = -1;
  aftFlapL.rotation.y = 0.1;
  shipGroup.add(aftFlapL);

  const aftFlapR = createStarshipFlap(0.62, 1.02, false, pureSteelMat, heatTileMat);
  aftFlapR.position.set(0.68, -0.32, -0.04);
  aftFlapR.rotation.y = -0.1;
  shipGroup.add(aftFlapR);

  // 5. Starship Raptor Engine Skirt (3 Vacuum + 3 Sea-level Raptor bells)
  const shipSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.45, 0.24, 24),
    darkMetalMat
  );
  shipSkirt.position.y = -0.84;
  shipGroup.add(shipSkirt);

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const bell = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 12), engineBellMat);
    bell.position.set(Math.cos(a) * 0.21, -0.96, Math.sin(a) * 0.21);
    shipGroup.add(bell);
  }

  // 6. Starship Raptor Methalox Blue-Violet Plasma Flame (ignites on Hot-Staging!)
  const flame2Group = new THREE.Group();
  flame2Group.position.y = -1.08;
  flame2Group.visible = false;

  const s2Outer = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 2.2, 16),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  s2Outer.rotation.x = Math.PI;
  s2Outer.position.y = -1.1;
  flame2Group.add(s2Outer);

  const s2Core = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 1.45, 14),
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  s2Core.rotation.x = Math.PI;
  s2Core.position.y = -0.72;
  flame2Group.add(s2Core);

  shipGroup.add(flame2Group);

  // 7. Aerodynamic Friction Fire & Re-entry Plasma Bow-Shock (火光特效)
  const plasmaGroup = new THREE.Group();
  plasmaGroup.position.y = 0.85;

  const plasmaOuterMat = new THREE.MeshBasicMaterial({
    color: 0xff5500,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const plasmaInnerMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Curved bow-shock cone hugging the ogive nosecone
  const bowShockOuter = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
    plasmaOuterMat
  );
  bowShockOuter.scale.set(1.05, 1.65, 1.05);
  bowShockOuter.position.y = -0.15;
  plasmaGroup.add(bowShockOuter);

  const bowShockInner = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    plasmaInnerMat
  );
  bowShockInner.scale.set(1.0, 1.55, 1.0);
  bowShockInner.position.y = 0.12;
  plasmaGroup.add(bowShockInner);

  // Dynamic orange fire PointLight that illuminates the stainless steel hull during atmospheric breakthrough / re-entry
  const fireLight = new THREE.PointLight(0xff6b00, 0, 10);
  fireLight.position.set(0, 1.4, 1.2);
  plasmaGroup.add(fireLight);

  shipGroup.add(plasmaGroup);

  // 8. Landing Thruster / Drogue Chute for final splashdown visual clarity
  const parachute = new THREE.Group();
  parachute.position.y = 2.0;
  parachute.visible = false;
  const chuteCanopy = new THREE.Mesh(
    new THREE.SphereGeometry(1.75, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.65,
      side: THREE.DoubleSide,
    })
  );
  chuteCanopy.position.y = 1.6;
  parachute.add(chuteCanopy);

  const cordMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0 });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(angle) * 1.6, 1.75, Math.sin(angle) * 1.6),
    ];
    parachute.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cordMat));
  }
  shipGroup.add(parachute);

  root.add(shipGroup);

  // ==========================================================
  // SUPER HEAVY BOOSTER (Stage 1: Hot-Staging Ring + Grid Fins + 33-Raptor Cluster)
  // ==========================================================
  const stage1 = new THREE.Group();
  stage1.position.y = -1.25;

  // 1. Vented Hot-Staging Ring (top of Super Heavy)
  const hotStageRing = new THREE.Group();
  hotStageRing.position.y = 1.24;
  const ringTop = new THREE.Mesh(new THREE.CylinderGeometry(0.465, 0.465, 0.08, 24), darkMetalMat);
  ringTop.position.y = 0.14;
  hotStageRing.add(ringTop);

  const ringBase = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.08, 24), darkMetalMat);
  ringBase.position.y = -0.1;
  hotStageRing.add(ringBase);

  // Vertical struts creating iconic open vents
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.04), darkMetalMat);
    strut.position.set(Math.cos(a) * 0.45, 0.02, Math.sin(a) * 0.45);
    hotStageRing.add(strut);
  }
  stage1.add(hotStageRing);

  // 2. Super Heavy tall stainless steel cylindrical body
  const bBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.47, 0.48, 2.35, 28),
    boosterSteelMat
  );
  bBody.position.y = -0.05;
  stage1.add(bBody);

  // Vertical black chine/raceway fairings running down sides of Super Heavy
  [-0.47, 0.47].forEach((x) => {
    const chine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.1), darkMetalMat);
    chine.position.set(x, -0.15, 0);
    stage1.add(chine);
  });

  // 3. Four Titanium Grid Fins mounted near top of Super Heavy
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const gf = createGridFin(darkMetalMat);
    gf.position.set(Math.cos(angle) * 0.72, 0.92, Math.sin(angle) * 0.72);
    gf.rotation.y = -angle;
    stage1.add(gf);
  }

  // 4. Black thermal engine skirt & Raptor cluster at base
  const bSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.485, 0.5, 0.36, 24),
    heatTileMat
  );
  bSkirt.position.y = -1.26;
  stage1.add(bSkirt);

  // Outer ring of Raptor nozzles + center cluster
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const n = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), engineBellMat);
    n.position.set(Math.cos(a) * 0.36, -1.48, Math.sin(a) * 0.36);
    stage1.add(n);
  }
  const centerBell = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 10), engineBellMat);
  centerBell.position.y = -1.48;
  stage1.add(centerBell);

  // 5. Massive Super Heavy 33-Raptor Methalox Plume (bright white-gold core + orange/blue Mach shock)
  const flame1Group = new THREE.Group();
  flame1Group.position.y = -1.55;

  const outerPlume = new THREE.Mesh(
    new THREE.ConeGeometry(0.68, 3.6, 18),
    new THREE.MeshBasicMaterial({
      color: 0xff7b1a,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  outerPlume.rotation.x = Math.PI;
  outerPlume.position.y = -1.8;
  flame1Group.add(outerPlume);

  const midPlume = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 2.6, 16),
    new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  midPlume.rotation.x = Math.PI;
  midPlume.position.y = -1.3;
  flame1Group.add(midPlume);

  const corePlume = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 1.9, 14),
    new THREE.MeshBasicMaterial({
      color: 0xfef9c3,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  corePlume.rotation.x = Math.PI;
  corePlume.position.y = -0.95;
  flame1Group.add(corePlume);

  // Dynamic engine glow light on booster base
  const engineLight = new THREE.PointLight(0xff8c24, 2.2, 12);
  engineLight.position.set(0, -1.6, 1.0);
  flame1Group.add(engineLight);

  stage1.add(flame1Group);
  root.add(stage1);

  return {
    root,
    ship: shipGroup,
    stage2: shipGroup, // compatibility alias
    stage1,
    flame1: flame1Group,
    flame2: flame2Group,
    plasmaOuterMat,
    plasmaInnerMat,
    fireLight,
    parachute,
    flaps: [fwdFlapL, fwdFlapR, aftFlapL, aftFlapR],
  };
}

// Starbase Mechazilla Launch Tower & Orbital Launch Mount
export function createLaunchpad() {
  const group = new THREE.Group();

  // Coastal Starbase ground
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(70, 36),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -3.1;
  group.add(ground);

  // Orbital Launch Mount (OLM) ring on concrete legs
  const olmMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.4 });
  const olmRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.22, 10, 24), olmMat);
  olmRing.rotation.x = Math.PI / 2;
  olmRing.position.y = -2.45;
  group.add(olmRing);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.8, 8), olmMat);
    leg.position.set(Math.cos(a) * 1.15, -2.8, Math.sin(a) * 1.15);
    group.add(leg);
  }

  // Mechazilla Steel Lattice Catch Tower
  const tower = new THREE.Group();
  tower.position.set(-2.9, 0.7, -0.7);

  const towerMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.65 });
  const pillarGeo = new THREE.BoxGeometry(0.16, 7.6, 0.16);
  [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]].forEach(([x, z]) => {
    const p = new THREE.Mesh(pillarGeo, towerMat);
    p.position.set(x, 0, z);
    tower.add(p);
  });

  for (let y = -3.2; y <= 3.6; y += 1.0) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.2), towerMat);
    beam.position.y = y;
    tower.add(beam);
  }

  // Iconic "Chopsticks" Catch Arms
  const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.7 });
  [-0.55, 0.55].forEach((zOff) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.2, 0.16), armMat);
    arm.position.set(1.6, 0.85, 0.7 + zOff);
    tower.add(arm);
  });

  group.add(tower);
  return group;
}

function makeMoonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(0, 0, 512, 256);

  for (let i = 0; i < 16; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 18 + Math.random() * 44;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, 'rgba(75, 85, 99, 0.65)');
    grad.addColorStop(1, 'rgba(156, 163, 175, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 95; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 3 + Math.random() * 14;
    ctx.fillStyle = 'rgba(55, 65, 81, 0.55)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(229, 231, 235, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x - r * 0.12, y - r * 0.12, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 256);
  oceanGrad.addColorStop(0, '#0284c7');
  oceanGrad.addColorStop(0.5, '#0369a1');
  oceanGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#22c55e';
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * 512;
    const y = 30 + Math.random() * 196;
    const rx = 18 + Math.random() * 48;
    const ry = 12 + Math.random() * 28;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 238, 512, 18);

  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  for (let i = 0; i < 36; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.ellipse(x, y, 22 + Math.random() * 40, 5 + Math.random() * 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMoon() {
  const group = new THREE.Group();
  const tex = makeMoonTexture();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(14, 32, 24),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.92,
      metalness: 0.04,
    })
  );
  group.add(sphere);

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8),
    new THREE.MeshBasicMaterial({ color: 0xfde047 })
  );
  beacon.position.set(0, 14.8, 0);
  group.add(beacon);

  return group;
}

export function createEarth() {
  const group = new THREE.Group();
  const tex = makeEarthTexture();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(18, 32, 24),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.7,
      metalness: 0.08,
    })
  );
  group.add(sphere);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(19.2, 28, 20),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(halo);
  return group;
}

function getRockGeometry() {
  if (shared.rockGeo) return shared.rockGeo;
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const noise = 0.78 + Math.sin(vx * 5.1 + vy * 3.7) * 0.14 + Math.cos(vz * 4.3 - vx * 2.9) * 0.12;
    pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
  }
  geo.computeVertexNormals();
  shared.rockGeo = geo;
  return geo;
}

export function createMeteor(isFiery = false, radius = 0.95) {
  const group = new THREE.Group();

  const mat = isFiery
    ? new THREE.MeshStandardMaterial({
        color: 0x7c2d12,
        emissive: 0xea580c,
        emissiveIntensity: 0.85,
        roughness: 0.75,
        flatShading: true,
      })
    : new THREE.MeshStandardMaterial({
        color: 0x64748b,
        emissive: 0x1e293b,
        emissiveIntensity: 0.2,
        roughness: 0.9,
        flatShading: true,
      });

  const rock = new THREE.Mesh(getRockGeometry(), mat);
  rock.scale.setScalar(radius);
  group.add(rock);

  if (isFiery) {
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 0.88, radius * 3.2, 10),
      new THREE.MeshBasicMaterial({
        color: 0xfb923c,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    tail.position.y = radius * 1.7;
    group.add(tail);
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.08, radius * 1.24, 20),
    new THREE.MeshBasicMaterial({
      color: isFiery ? 0xf43f5e : 0xfbbf24,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    })
  );
  group.add(ring);

  return { group, rock, ring, radius };
}

export function createStarPickup() {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    })
  );
  group.add(core);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.06, 8, 24),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    })
  );
  group.add(halo);

  return { group, core, halo };
}

// Soft layered sprite cloud bank (supports both background & foreground cloud-veil obstruction)
export function createCloudCluster(isForeground = false) {
  const group = new THREE.Group();
  const tex = makeCloudSpriteTexture();
  const puffCount = isForeground ? 4 : 3;

  for (let i = 0; i < puffCount; i++) {
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color: 0xf8fafc,
      transparent: true,
      opacity: isForeground ? 0.58 + Math.random() * 0.22 : 0.65 + Math.random() * 0.25,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    const scaleX = isForeground ? 7.5 + Math.random() * 5.5 : 6.0 + Math.random() * 4.5;
    const scaleY = scaleX * (0.55 + Math.random() * 0.2);
    sprite.scale.set(scaleX, scaleY, 1);
    sprite.position.set(
      (Math.random() - 0.5) * 4.5,
      (Math.random() - 0.5) * 1.6,
      (Math.random() - 0.5) * 1.4
    );
    group.add(sprite);
  }
  return group;
}

export function createStarfield(count = 700) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 110;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 110;
    positions[i * 3 + 2] = -15 - Math.random() * 75;

    const tint = Math.random();
    if (tint < 0.2) c.setHex(0xbae6fd);
    else if (tint < 0.35) c.setHex(0xfef08a);
    else c.setHex(0xffffff);

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.42,
    vertexColors: true,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });

  return new THREE.Points(geo, mat);
}
