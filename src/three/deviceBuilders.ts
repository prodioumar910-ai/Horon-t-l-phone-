import * as THREE from 'three';
import {
  createBrushedMetalRoughnessTexture,
  createOledScreenTexture,
} from './proceduralTextures.ts';

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

function createExtrudedSlab(
  width: number,
  height: number,
  depth: number,
  radius: number,
  bevelSize = 0.02,
): THREE.ExtrudeGeometry {
  const shape = createRoundedRectShape(width, height, radius);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevelSize > 0,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 4,
    curveSegments: 18,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

function createRoundedPlane(width: number, height: number, radius: number): THREE.ShapeGeometry {
  const shape = createRoundedRectShape(width, height, radius);
  const geo = new THREE.ShapeGeometry(shape, 18);
  // Normalize UVs cleanly to [0, 1]
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uv[i * 2] = (px + width / 2) / width;
    uv[i * 2 + 1] = (py + height / 2) / height;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function createCameraLensAssembly(
  radius: number,
  ringMat: THREE.Material,
  darkHousingMat: THREE.Material,
  glassMat: THREE.Material,
  irisMat: THREE.Material,
): THREE.Group {
  const lensGroup = new THREE.Group();

  // Outer machined metal bezel ring
  const bezelGeo = new THREE.CylinderGeometry(radius, radius * 1.03, 0.042, 32);
  bezelGeo.rotateX(Math.PI / 2);
  const bezel = new THREE.Mesh(bezelGeo, ringMat);
  bezel.castShadow = true;
  lensGroup.add(bezel);

  // Inner dark optical step
  const barrelGeo = new THREE.CylinderGeometry(radius * 0.78, radius * 0.78, 0.046, 28);
  barrelGeo.rotateX(Math.PI / 2);
  const barrel = new THREE.Mesh(barrelGeo, darkHousingMat);
  barrel.position.z = -0.002;
  lensGroup.add(barrel);

  // Inner optical iris ring
  const irisGeo = new THREE.RingGeometry(radius * 0.24, radius * 0.44, 24);
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.position.z = -0.026;
  iris.rotation.y = Math.PI;
  lensGroup.add(iris);

  // Sapphire lens glass cap
  const glassGeo = new THREE.CylinderGeometry(radius * 0.75, radius * 0.75, 0.012, 28);
  glassGeo.rotateX(Math.PI / 2);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.z = -0.025;
  lensGroup.add(glass);

  return lensGroup;
}

export interface ShowroomDevices {
  appleGroup: THREE.Group;
  samsungGroup: THREE.Group;
  brandGroup: THREE.Group;
  brandRingModule: THREE.Group;
  brandRectModule: THREE.Group;
  brandBackMat: THREE.MeshPhysicalMaterial;
  brandFrameMat: THREE.MeshPhysicalMaterial;
  brandScreenMat: THREE.MeshStandardMaterial;
  brandTextures: {
    tecno: THREE.Texture;
    infinix: THREE.CanvasTexture;
    xiaomi: THREE.CanvasTexture;
  };
  brandBackTextures: {
    tecno: THREE.Texture | null;
  };
  tabletsGroup: THREE.Group;
  dispose: () => void;
}

export function buildShowroomDevices(
  isSoftwareGl: boolean,
  maxAnisotropy: number,
  onTextureReady?: () => void,
): ShowroomDevices {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  const brushedMap = trackTex(createBrushedMetalRoughnessTexture());

  const appleScreenTex = trackTex(createOledScreenTexture('apple', maxAnisotropy));
  const samsungScreenTex = trackTex(createOledScreenTexture('samsung', maxAnisotropy));
  const tecnoScreenTex = trackTex(createOledScreenTexture('tecno', maxAnisotropy));
  const infinixScreenTex = trackTex(createOledScreenTexture('infinix', maxAnisotropy));
  const xiaomiScreenTex = trackTex(createOledScreenTexture('xiaomi', maxAnisotropy));
  const ipadScreenTex = trackTex(createOledScreenTexture('ipad', maxAnisotropy));
  const tabScreenTex = trackTex(createOledScreenTexture('tab', maxAnisotropy));

  const texLoader = new THREE.TextureLoader();
  const tecnoPhotoFront = trackTex(
    texLoader.load('/assets/tecno-camon-front.jpg', () => {
      onTextureReady?.();
    }),
  );
  tecnoPhotoFront.colorSpace = THREE.SRGBColorSpace;
  tecnoPhotoFront.anisotropy = maxAnisotropy;

  const tecnoPhotoBack = trackTex(
    texLoader.load('/assets/tecno-camon-back.jpg', () => {
      onTextureReady?.();
    }),
  );
  tecnoPhotoBack.colorSpace = THREE.SRGBColorSpace;
  tecnoPhotoBack.anisotropy = maxAnisotropy;

  // Shared optical materials
  const darkBezelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0b0d12,
      roughness: 0.14,
      metalness: 0.1,
    }),
  );
  const darkOpticalMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x07090d,
      roughness: 0.25,
      metalness: 0.4,
    }),
  );
  const lensIrisMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x16396b,
      roughness: 0.15,
      metalness: 0.85,
      iridescence: isSoftwareGl ? 0 : 0.7,
    }),
  );
  const sapphireGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x101828,
      metalness: 0.1,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      transparent: true,
      opacity: isSoftwareGl ? 0.55 : 0.78,
      reflectivity: 1.0,
    }),
  );
  const flashMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf4efe2,
      emissive: 0xfff8e6,
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.1,
    }),
  );

  // =========================================================================
  // 1. APPLE PRO FLAGSHIP (Natural Titanium, Rounded Bevel, Triple Diagonal)
  // =========================================================================
  const appleGroup = new THREE.Group();
  const titaniumFrameMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb7b2a9,
      metalness: 0.92,
      roughness: 0.22,
      roughnessMap: brushedMap,
      anisotropy: isSoftwareGl ? 0 : 0.8,
      clearcoat: 0.15,
    }),
  );
  const titaniumBackMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xc2bdb4,
      metalness: 0.22,
      roughness: 0.58,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
    }),
  );
  const cameraPlateauMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd0cbc2,
      metalness: 0.18,
      roughness: 0.16,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    }),
  );

  const phoneW = 1.44;
  const phoneH = 2.98;
  const phoneD = 0.145;

  const appleChassis = new THREE.Mesh(
    trackGeo(createExtrudedSlab(phoneW, phoneH, phoneD, 0.24, 0.022)),
    titaniumFrameMat,
  );
  appleChassis.castShadow = true;
  appleChassis.receiveShadow = true;
  appleGroup.add(appleChassis);

  // Front black bezel glass
  const appleFrontBezel = new THREE.Mesh(
    trackGeo(createRoundedPlane(phoneW - 0.04, phoneH - 0.04, 0.22)),
    darkBezelMat,
  );
  appleFrontBezel.position.z = phoneD / 2 + 0.024;
  appleGroup.add(appleFrontBezel);

  // Active OLED screen
  const appleScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: appleScreenTex,
      emissiveMap: appleScreenTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.52,
      roughness: 0.1,
      metalness: 0.05,
    }),
  );
  const appleScreen = new THREE.Mesh(
    trackGeo(createRoundedPlane(phoneW - 0.11, phoneH - 0.11, 0.19)),
    appleScreenMat,
  );
  appleScreen.position.z = phoneD / 2 + 0.026;
  appleGroup.add(appleScreen);

  // Dynamic Island pill cutout
  const island = new THREE.Mesh(
    trackGeo(createRoundedPlane(0.36, 0.095, 0.045)),
    darkBezelMat,
  );
  island.position.set(0, phoneH / 2 - 0.18, phoneD / 2 + 0.028);
  appleGroup.add(island);

  // Rear frosted glass plate
  const appleBackPlate = new THREE.Mesh(
    trackGeo(createRoundedPlane(phoneW - 0.06, phoneH - 0.06, 0.21)),
    titaniumBackMat,
  );
  appleBackPlate.position.z = -(phoneD / 2 + 0.023);
  appleBackPlate.rotation.y = Math.PI;
  appleGroup.add(appleBackPlate);

  // Raised square camera plateau
  const plateau = new THREE.Mesh(
    trackGeo(createExtrudedSlab(0.68, 0.72, 0.035, 0.14, 0.012)),
    cameraPlateauMat,
  );
  plateau.position.set(0.31, phoneH / 2 - 0.48, -(phoneD / 2 + 0.036));
  appleGroup.add(plateau);

  // 3 Triple Pro Lenses
  const lensCoords: Array<[number, number]> = [
    [0.45, phoneH / 2 - 0.32],
    [0.45, phoneH / 2 - 0.64],
    [0.16, phoneH / 2 - 0.48],
  ];
  lensCoords.forEach(([lx, ly]) => {
    const lens = createCameraLensAssembly(
      0.135,
      titaniumFrameMat,
      darkOpticalMat,
      sapphireGlassMat,
      lensIrisMat,
    );
    lens.position.set(lx, ly, -(phoneD / 2 + 0.065));
    appleGroup.add(lens);
  });

  // LiDAR & Flash
  const lidar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 24)).rotateX(Math.PI / 2),
    darkOpticalMat,
  );
  lidar.position.set(0.16, phoneH / 2 - 0.67, -(phoneD / 2 + 0.056));
  appleGroup.add(lidar);

  const flash = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.048, 0.048, 0.01, 24)).rotateX(Math.PI / 2),
    flashMat,
  );
  flash.position.set(0.16, phoneH / 2 - 0.29, -(phoneD / 2 + 0.056));
  appleGroup.add(flash);

  // Side buttons
  const powerBtn = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.026, 0.34, 0.045)),
    titaniumFrameMat,
  );
  powerBtn.position.set(phoneW / 2 + 0.024, 0.32, 0);
  appleGroup.add(powerBtn);

  const volUp = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.026, 0.22, 0.045)),
    titaniumFrameMat,
  );
  volUp.position.set(-(phoneW / 2 + 0.024), 0.56, 0);
  appleGroup.add(volUp);

  const volDown = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.026, 0.22, 0.045)),
    titaniumFrameMat,
  );
  volDown.position.set(-(phoneW / 2 + 0.024), 0.26, 0);
  appleGroup.add(volDown);

  // =========================================================================
  // 2. SAMSUNG GALAXY ULTRA (Sharper Armor Titanium, Vertical Floating Lenses + S-Pen)
  // =========================================================================
  const samsungGroup = new THREE.Group();
  const armorFrameMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xa4aab3,
      metalness: 0.94,
      roughness: 0.2,
      roughnessMap: brushedMap,
      anisotropy: isSoftwareGl ? 0 : 0.85,
    }),
  );
  const obsidianBackMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x20242c,
      metalness: 0.15,
      roughness: 0.5,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
    }),
  );

  const samW = 1.48;
  const samH = 3.08;
  const samD = 0.15;

  const samChassis = new THREE.Mesh(
    trackGeo(createExtrudedSlab(samW, samH, samD, 0.06, 0.015)),
    armorFrameMat,
  );
  samChassis.castShadow = true;
  samsungGroup.add(samChassis);

  const samFrontBezel = new THREE.Mesh(
    trackGeo(createRoundedPlane(samW - 0.03, samH - 0.03, 0.05)),
    darkBezelMat,
  );
  samFrontBezel.position.z = samD / 2 + 0.017;
  samsungGroup.add(samFrontBezel);

  const samScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: samsungScreenTex,
      emissiveMap: samsungScreenTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.55,
      roughness: 0.08,
      metalness: 0.06,
    }),
  );
  const samScreen = new THREE.Mesh(
    trackGeo(createRoundedPlane(samW - 0.08, samH - 0.08, 0.04)),
    samScreenMat,
  );
  samScreen.position.z = samD / 2 + 0.019;
  samsungGroup.add(samScreen);

  // Punch-hole selfie camera
  const punchHole = new THREE.Mesh(
    trackGeo(new THREE.CircleGeometry(0.032, 20)),
    darkBezelMat,
  );
  punchHole.position.set(0, samH / 2 - 0.13, samD / 2 + 0.021);
  samsungGroup.add(punchHole);

  const samBackPlate = new THREE.Mesh(
    trackGeo(createRoundedPlane(samW - 0.04, samH - 0.04, 0.05)),
    obsidianBackMat,
  );
  samBackPlate.position.z = -(samD / 2 + 0.016);
  samBackPlate.rotation.y = Math.PI;
  samsungGroup.add(samBackPlate);

  // 3 main vertical lenses + 2 auxiliary lenses
  const samMainY = [samH / 2 - 0.34, samH / 2 - 0.68, samH / 2 - 1.02];
  samMainY.forEach((ly) => {
    const lens = createCameraLensAssembly(
      0.128,
      armorFrameMat,
      darkOpticalMat,
      sapphireGlassMat,
      lensIrisMat,
    );
    lens.position.set(0.42, ly, -(samD / 2 + 0.045));
    samsungGroup.add(lens);
  });

  [samH / 2 - 0.34, samH / 2 - 0.68].forEach((ly) => {
    const auxLens = createCameraLensAssembly(
      0.075,
      armorFrameMat,
      darkOpticalMat,
      sapphireGlassMat,
      lensIrisMat,
    );
    auxLens.position.set(0.14, ly, -(samD / 2 + 0.042));
    samsungGroup.add(auxLens);
  });

  // S-Pen stylus hovering beside Galaxy Ultra
  const spenGroup = new THREE.Group();
  const spenBody = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.042, 0.042, 2.05, 20)),
    armorFrameMat,
  );
  spenGroup.add(spenBody);
  const spenTip = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.042, 0.16, 20)),
    darkBezelMat,
  );
  spenTip.position.y = -1.105;
  spenTip.rotation.x = Math.PI;
  spenGroup.add(spenTip);
  const spenCap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.044, 0.044, 0.12, 20)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1769e0,
        metalness: 0.7,
        roughness: 0.25,
      }),
    ),
  );
  spenCap.position.y = 1.05;
  spenGroup.add(spenCap);
  spenGroup.position.set(-1.12, -0.18, 0.22);
  spenGroup.rotation.z = -0.14;
  samsungGroup.add(spenGroup);

  // =========================================================================
  // 3. MULTI-BRAND FLAGSHIP (TECNO / INFINIX Halo Ring vs XIAOMI Rectangular Optical)
  // =========================================================================
  const brandGroup = new THREE.Group();
  const brandFrameMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd4cec2,
      metalness: 0.88,
      roughness: 0.22,
      anisotropy: isSoftwareGl ? 0 : 0.75,
    }),
  );
  const brandBackMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xdcd7cd,
      metalness: 0.12,
      roughness: 0.45,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
    }),
  );
  const brandScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: tecnoPhotoFront || tecnoScreenTex,
      emissiveMap: tecnoPhotoFront || tecnoScreenTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.48,
      roughness: 0.1,
      metalness: 0.05,
    }),
  );

  const bW = 1.44;
  const bH = 2.98;
  const bD = 0.14;

  const brandChassis = new THREE.Mesh(
    trackGeo(createExtrudedSlab(bW, bH, bD, 0.2, 0.02)),
    brandFrameMat,
  );
  brandChassis.castShadow = true;
  brandGroup.add(brandChassis);

  const brandFrontBezel = new THREE.Mesh(
    trackGeo(createRoundedPlane(bW - 0.04, bH - 0.04, 0.18)),
    darkBezelMat,
  );
  brandFrontBezel.position.z = bD / 2 + 0.022;
  brandGroup.add(brandFrontBezel);

  const brandScreen = new THREE.Mesh(
    trackGeo(createRoundedPlane(bW - 0.09, bH - 0.09, 0.16)),
    brandScreenMat,
  );
  brandScreen.position.z = bD / 2 + 0.024;
  brandGroup.add(brandScreen);

  const brandBack = new THREE.Mesh(
    trackGeo(createRoundedPlane(bW - 0.05, bH - 0.05, 0.18)),
    brandBackMat,
  );
  brandBack.position.z = -(bD / 2 + 0.021);
  brandBack.rotation.y = Math.PI;
  brandGroup.add(brandBack);

  // Halo circular camera module (Tecno / Infinix)
  const brandRingModule = new THREE.Group();
  const haloBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.48, 0.5, 0.05, 48)).rotateX(Math.PI / 2),
    brandFrameMat,
  );
  brandRingModule.add(haloBase);

  const haloGlass = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.43, 0.43, 0.055, 48)).rotateX(Math.PI / 2),
    darkBezelMat,
  );
  haloGlass.position.z = -0.004;
  brandRingModule.add(haloGlass);

  const haloOffsets: Array<[number, number]> = [
    [-0.17, 0.13],
    [0.17, 0.13],
    [0, -0.17],
  ];
  haloOffsets.forEach(([ox, oy]) => {
    const l = createCameraLensAssembly(
      0.11,
      brandFrameMat,
      darkOpticalMat,
      sapphireGlassMat,
      lensIrisMat,
    );
    l.position.set(ox, oy, -0.045);
    brandRingModule.add(l);
  });
  brandRingModule.position.set(0, bH / 2 - 0.72, -(bD / 2 + 0.04));
  brandGroup.add(brandRingModule);

  // Rectangular optical module (Xiaomi / Redmi)
  const brandRectModule = new THREE.Group();
  const rectIsland = new THREE.Mesh(
    trackGeo(createExtrudedSlab(0.68, 0.72, 0.045, 0.14, 0.012)),
    darkBezelMat,
  );
  brandRectModule.add(rectIsland);
  const rectOffsets: Array<[number, number]> = [
    [-0.15, 0.15],
    [0.15, 0.15],
    [-0.15, -0.15],
  ];
  rectOffsets.forEach(([ox, oy]) => {
    const l = createCameraLensAssembly(
      0.115,
      brandFrameMat,
      darkOpticalMat,
      sapphireGlassMat,
      lensIrisMat,
    );
    l.position.set(ox, oy, -0.048);
    brandRectModule.add(l);
  });
  brandRectModule.position.set(0.28, bH / 2 - 0.52, -(bD / 2 + 0.045));
  brandRectModule.visible = false;
  brandGroup.add(brandRectModule);

  // =========================================================================
  // 4. TABLETS & IPADS COMPOSITION (Dual Aluminum Tablets + Magnetic Stylus)
  // =========================================================================
  const tabletsGroup = new THREE.Group();
  const silverAlumMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd9dde2,
      metalness: 0.9,
      roughness: 0.24,
      anisotropy: isSoftwareGl ? 0 : 0.75,
    }),
  );
  const spaceGrayAlumMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x5c6370,
      metalness: 0.88,
      roughness: 0.26,
      anisotropy: isSoftwareGl ? 0 : 0.75,
    }),
  );

  // Pro Tablet 1 (Silver vertical-angled)
  const ipadGroup = new THREE.Group();
  const ipadW = 2.15;
  const ipadH = 2.95;
  const ipadD = 0.095;
  const ipadBody = new THREE.Mesh(
    trackGeo(createExtrudedSlab(ipadW, ipadH, ipadD, 0.14, 0.012)),
    silverAlumMat,
  );
  ipadBody.castShadow = true;
  ipadGroup.add(ipadBody);

  const ipadBezel = new THREE.Mesh(
    trackGeo(createRoundedPlane(ipadW - 0.03, ipadH - 0.03, 0.12)),
    darkBezelMat,
  );
  ipadBezel.position.z = ipadD / 2 + 0.014;
  ipadGroup.add(ipadBezel);

  const ipadScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: ipadScreenTex,
      emissiveMap: ipadScreenTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.58,
      roughness: 0.09,
    }),
  );
  const ipadScreen = new THREE.Mesh(
    trackGeo(createRoundedPlane(ipadW - 0.13, ipadH - 0.13, 0.09)),
    ipadScreenMat,
  );
  ipadScreen.position.z = ipadD / 2 + 0.016;
  ipadGroup.add(ipadScreen);
  ipadGroup.position.set(-0.52, 0.15, 0.25);
  ipadGroup.rotation.set(-0.08, 0.34, 0.04);
  tabletsGroup.add(ipadGroup);

  // Galaxy Tab 2 (Landscape-angled behind/right)
  const tabGroup = new THREE.Group();
  const tabW = 2.85;
  const tabH = 1.92;
  const tabD = 0.09;
  const tabBody = new THREE.Mesh(
    trackGeo(createExtrudedSlab(tabW, tabH, tabD, 0.12, 0.012)),
    spaceGrayAlumMat,
  );
  tabBody.castShadow = true;
  tabGroup.add(tabBody);

  const tabBezel = new THREE.Mesh(
    trackGeo(createRoundedPlane(tabW - 0.03, tabH - 0.03, 0.1)),
    darkBezelMat,
  );
  tabBezel.position.z = tabD / 2 + 0.014;
  tabGroup.add(tabBezel);

  const tabScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: tabScreenTex,
      emissiveMap: tabScreenTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.58,
      roughness: 0.09,
    }),
  );
  const tabScreen = new THREE.Mesh(
    trackGeo(createRoundedPlane(tabW - 0.12, tabH - 0.12, 0.08)),
    tabScreenMat,
  );
  tabScreen.position.z = tabD / 2 + 0.016;
  tabGroup.add(tabScreen);

  // Pencil hovering above landscape tab
  const pencil = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.036, 0.036, 1.85, 20)),
    silverAlumMat,
  );
  pencil.rotation.z = Math.PI / 2 - 0.08;
  pencil.position.set(0.1, tabH / 2 + 0.24, 0.18);
  tabGroup.add(pencil);

  tabGroup.position.set(0.76, -0.35, -0.52);
  tabGroup.rotation.set(-0.14, -0.28, -0.05);
  tabletsGroup.add(tabGroup);

  return {
    appleGroup,
    samsungGroup,
    brandGroup,
    brandRingModule,
    brandRectModule,
    brandBackMat,
    brandFrameMat,
    brandScreenMat,
    brandTextures: {
      tecno: tecnoPhotoFront || tecnoScreenTex,
      infinix: infinixScreenTex,
      xiaomi: xiaomiScreenTex,
    },
    brandBackTextures: {
      tecno: tecnoPhotoBack,
    },
    tabletsGroup,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
