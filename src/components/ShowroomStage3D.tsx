import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { buildShowroomDevices } from '../three/deviceBuilders.ts';
import { createContactShadowTexture } from '../three/proceduralTextures.ts';

export type StorySceneId = 'hero' | 'apple' | 'samsung' | 'brands' | 'tablets';

export interface StoryStageState {
  scene: StorySceneId;
  heroIntroProgress: number;
  appleProgress: number;
  samsungProgress: number;
  brandsProgress: number;
  tabletsProgress: number;
  activeBrandStyle: 'apple' | 'samsung' | 'tecno' | 'infinix' | 'xiaomi';
  pointerX: number;
  pointerY: number;
}

interface ShowroomStage3DProps {
  stageStateRef: React.MutableRefObject<StoryStageState>;
  registerTriggerRender: (fn: () => void) => void;
  reducedMotion: boolean;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

// Reusable scratch vectors to prevent GC churn inside animation frames
const _targetColor = new THREE.Color();

export const ShowroomStage3D: React.FC<ShowroomStage3DProps> = ({
  stageStateRef,
  registerTriggerRender,
  reducedMotion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const canvas = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    const handleContextRestored = () => {
      setWebglUnavailable(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || 1280, container.clientHeight || 720);

    container.innerHTML = '';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      (container.clientWidth || 1280) / (container.clientHeight || 720),
      0.1,
      50,
    );
    camera.position.set(0, 0.12, 7.6);

    // Studio Reflection Environment (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xf3f6fc, 0xd8dce3, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf2, 1.45);
    keyLight.position.set(4.5, 6.2, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd9e8ff, 1.1);
    rimLight.position.set(-5.0, 3.2, -4.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxLeft = new THREE.RectAreaLight(0xffffff, 2.2, 3.5, 5);
      softboxLeft.position.set(-4.2, 1.8, 3.2);
      softboxLeft.lookAt(0, 0, 0);
      scene.add(softboxLeft);

      const softboxRight = new THREE.RectAreaLight(0xeef4ff, 1.8, 3.0, 4.5);
      softboxRight.position.set(4.5, 2.2, 2.5);
      softboxRight.lookAt(0, 0, 0);
      scene.add(softboxRight);
    }

    const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy() || 1);
    let triggerOnLoad: () => void = () => {};
    const devices = buildShowroomDevices(isSoftwareGl, maxAnisotropy, () => {
      triggerOnLoad();
    });
    scene.add(devices.appleGroup);
    scene.add(devices.samsungGroup);
    scene.add(devices.brandGroup);
    scene.add(devices.tabletsGroup);

    // Contact shadow plane directly beneath hero stage
    const shadowTex = createContactShadowTexture();
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    });
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.6),
      shadowPlaneMat,
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.85, 0);
    scene.add(shadowPlane);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Current damped values
    const cur = {
      appleX: 0,
      appleY: 0,
      appleZ: 0,
      appleRotX: 0.08,
      appleRotY: -0.45,
      appleRotZ: 0.03,
      appleScale: 0.01,

      samX: 3.5,
      samY: 0,
      samZ: -1,
      samRotX: 0.06,
      samRotY: 2.6,
      samRotZ: 0,
      samScale: 0.001,

      brandX: 3.5,
      brandY: 0,
      brandZ: -1,
      brandRotX: 0.08,
      brandRotY: 2.7,
      brandRotZ: 0,
      brandScale: 0.001,

      tabX: 0,
      tabY: -3.5,
      tabZ: -1,
      tabRotX: 0.1,
      tabRotY: -0.3,
      tabScale: 0.001,

      shadowX: 0,
      shadowOpacity: 0.7,
    };

    let lastBrandStyle = '';
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTimestamp = performance.now();
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function computeTargets(dt: number, elapsedSec: number) {
      const st = stageStateRef.current;
      const isDesktop = (container?.clientWidth || 1024) >= 1024;
      const isMobile = (container?.clientWidth || 1024) < 768;
      const rightOffset = isDesktop ? 1.25 : 0;
      const mobileTopShift = isMobile ? 0.42 : 0;
      const dampSpeed = reducedMotion ? 24 : 7.5;

      const hoverX = reducedMotion ? 0 : st.pointerX * 0.14;
      const hoverY = reducedMotion ? 0 : st.pointerY * 0.09;
      const idleFloat = reducedMotion ? 0 : Math.sin(elapsedSec * 1.45) * 0.045;

      // Update Multi-brand material & camera module appearance
      if (st.activeBrandStyle !== lastBrandStyle) {
        lastBrandStyle = st.activeBrandStyle;
        if (st.activeBrandStyle === 'xiaomi') {
          devices.brandRingModule.visible = false;
          devices.brandRectModule.visible = true;
          devices.brandBackMat.map = null;
          _targetColor.setHex(0x1f242d);
          devices.brandBackMat.color.copy(_targetColor);
          devices.brandBackMat.needsUpdate = true;
          _targetColor.setHex(0x888f99);
          devices.brandFrameMat.color.copy(_targetColor);
          devices.brandScreenMat.map = devices.brandTextures.xiaomi;
          devices.brandScreenMat.emissiveMap = devices.brandTextures.xiaomi;
        } else if (st.activeBrandStyle === 'infinix') {
          devices.brandRingModule.visible = true;
          devices.brandRectModule.visible = false;
          devices.brandBackMat.map = null;
          _targetColor.setHex(0xcbd3df);
          devices.brandBackMat.color.copy(_targetColor);
          devices.brandBackMat.needsUpdate = true;
          _targetColor.setHex(0xb4bcc8);
          devices.brandFrameMat.color.copy(_targetColor);
          devices.brandScreenMat.map = devices.brandTextures.infinix;
          devices.brandScreenMat.emissiveMap = devices.brandTextures.infinix;
        } else {
          // TECNO CAMON: utiliser directement le design réel fourni (écran courbe + dos turquoise/argent 3 optiques)
          devices.brandRingModule.visible = false;
          devices.brandRectModule.visible = false;
          devices.brandBackMat.map = devices.brandBackTextures.tecno;
          _targetColor.setHex(0xffffff);
          devices.brandBackMat.color.copy(_targetColor);
          devices.brandBackMat.needsUpdate = true;
          _targetColor.setHex(0xd2d8e0);
          devices.brandFrameMat.color.copy(_targetColor);
          devices.brandScreenMat.map = devices.brandTextures.tecno;
          devices.brandScreenMat.emissiveMap = devices.brandTextures.tecno;
        }
        devices.brandScreenMat.needsUpdate = true;
      }

      // Target defaults (hidden off-stage)
      let tAppleX = -4.2,
        tAppleY = 0,
        tAppleZ = -1.5,
        tAppleRotX = 0.08,
        tAppleRotY = 0.25,
        tAppleRotZ = 0,
        tAppleScale = 0.001;

      let tSamX = 4.4,
        tSamY = 0,
        tSamZ = -1.5,
        tSamRotX = 0.08,
        tSamRotY = 2.8,
        tSamRotZ = 0,
        tSamScale = 0.001;

      let tBrandX = 4.4,
        tBrandY = 0,
        tBrandZ = -1.5,
        tBrandRotX = 0.08,
        tBrandRotY = 2.7,
        tBrandRotZ = 0,
        tBrandScale = 0.001;

      let tTabX = 0,
        tTabY = -4.2,
        tTabZ = -1.5,
        tTabRotX = 0.1,
        tTabRotY = -0.25,
        tTabScale = 0.001;

      let tShadowX = 0;
      let tShadowOpacity = 0.65;

      if (st.scene === 'hero') {
        const p = THREE.MathUtils.clamp(st.heroIntroProgress, 0, 1);
        // 0..0.3: hidden -> scale in; 0.3..0.75: rear triple-camera showcase; 0.75..1: balanced three-quarter showcase
        const emerge = THREE.MathUtils.smoothstep(p, 0.15, 0.55);
        tAppleScale = (isMobile ? 0.68 : isDesktop ? 0.96 : 0.84) * Math.max(0.001, emerge);
        tAppleX = 0;
        tAppleY = (isMobile ? 0.36 : 0.14) + idleFloat;
        tAppleZ = THREE.MathUtils.lerp(-1.2, 0.15, emerge);

        if (p < 0.72) {
          // Rotate to reveal rear sapphire triple-lens camera system
          tAppleRotY = THREE.MathUtils.lerp(-0.4, Math.PI - 0.35, THREE.MathUtils.smoothstep(p, 0.25, 0.68));
          tAppleRotX = 0.1;
          tAppleRotZ = -0.04;
        } else {
          // Settle into balanced front-three-quarter architectural poise
          const settle = THREE.MathUtils.smoothstep(p, 0.72, 1);
          tAppleRotY = THREE.MathUtils.lerp(Math.PI - 0.35, Math.PI * 2 - 0.38, settle) + hoverX;
          tAppleRotX = 0.06 + hoverY;
          tAppleRotZ = -0.025;
        }
        tShadowX = 0;
        tShadowOpacity = emerge * 0.68;
      } else if (st.scene === 'apple') {
        const p = THREE.MathUtils.clamp(st.appleProgress, 0, 1);
        // Progressive scroll: show rear camera close-up -> turn screen toward viewer
        tAppleScale = isMobile ? 0.66 : isDesktop ? 0.98 + p * 0.14 : 0.84;
        tAppleX = rightOffset;
        tAppleY = mobileTopShift + idleFloat;
        tAppleZ = THREE.MathUtils.lerp(0.1, 0.75, Math.sin(p * Math.PI));
        tAppleRotY = THREE.MathUtils.lerp(Math.PI - 0.42, Math.PI * 2 + 0.18, p) + hoverX;
        tAppleRotX = THREE.MathUtils.lerp(0.14, 0.04, p) + hoverY;
        tAppleRotZ = THREE.MathUtils.lerp(-0.08, 0.03, p);
        tShadowX = rightOffset;
        tShadowOpacity = 0.74;
      } else if (st.scene === 'samsung') {
        const p = THREE.MathUtils.clamp(st.samsungProgress, 0, 1);
        // Apple exits cleanly left, Samsung Galaxy Ultra enters and rotates to showcase camera + S Pen + AMOLED
        tAppleX = rightOffset - 3.6;
        tAppleScale = 0.001;
        tSamX = rightOffset;
        tSamY = mobileTopShift + idleFloat;
        tSamZ = THREE.MathUtils.lerp(-0.2, 0.55, Math.sin(p * Math.PI));
        tSamScale = isMobile ? 0.65 : isDesktop ? 0.98 : 0.84;
        tSamRotY = THREE.MathUtils.lerp(Math.PI + 0.45, Math.PI * 2 - 0.24, p) + hoverX;
        tSamRotX = THREE.MathUtils.lerp(0.12, 0.05, p) + hoverY;
        tSamRotZ = THREE.MathUtils.lerp(0.06, -0.02, p);
        tShadowX = rightOffset;
        tShadowOpacity = 0.75;
      } else if (st.scene === 'brands') {
        const p = THREE.MathUtils.clamp(st.brandsProgress, 0, 1);
        tBrandX = rightOffset;
        tBrandY = mobileTopShift + idleFloat;
        tBrandZ = 0.25;
        tBrandScale = isMobile ? 0.66 : isDesktop ? 0.98 : 0.84;
        // Show iconic rear camera ring / optical module first, then sweep cleanly
        tBrandRotY = THREE.MathUtils.lerp(Math.PI - 0.52, Math.PI * 1.62, p) + hoverX;
        tBrandRotX = 0.1 + hoverY;
        tBrandRotZ = -0.04;
        tShadowX = rightOffset;
        tShadowOpacity = 0.72;
      } else if (st.scene === 'tablets') {
        const p = THREE.MathUtils.clamp(st.tabletsProgress, 0, 1);
        tTabX = isDesktop ? 0.85 : 0;
        tTabY = (isMobile ? 0.35 : 0.05) + idleFloat * 0.7;
        tTabZ = THREE.MathUtils.lerp(-0.6, 0.15, p);
        tTabScale = isMobile ? 0.56 : isDesktop ? 0.86 : 0.74;
        tTabRotY = THREE.MathUtils.lerp(-0.45, 0.12, p) + hoverX * 0.7;
        tTabRotX = THREE.MathUtils.lerp(0.18, 0.04, p) + hoverY * 0.7;
        tShadowX = tTabX;
        tShadowOpacity = 0.55;
      }

      // Exponential damping
      cur.appleX = THREE.MathUtils.damp(cur.appleX, tAppleX, dampSpeed, dt);
      cur.appleY = THREE.MathUtils.damp(cur.appleY, tAppleY, dampSpeed, dt);
      cur.appleZ = THREE.MathUtils.damp(cur.appleZ, tAppleZ, dampSpeed, dt);
      cur.appleRotX = THREE.MathUtils.damp(cur.appleRotX, tAppleRotX, dampSpeed, dt);
      cur.appleRotY = THREE.MathUtils.damp(cur.appleRotY, tAppleRotY, dampSpeed, dt);
      cur.appleRotZ = THREE.MathUtils.damp(cur.appleRotZ, tAppleRotZ, dampSpeed, dt);
      cur.appleScale = THREE.MathUtils.damp(cur.appleScale, tAppleScale, dampSpeed, dt);

      cur.samX = THREE.MathUtils.damp(cur.samX, tSamX, dampSpeed, dt);
      cur.samY = THREE.MathUtils.damp(cur.samY, tSamY, dampSpeed, dt);
      cur.samZ = THREE.MathUtils.damp(cur.samZ, tSamZ, dampSpeed, dt);
      cur.samRotX = THREE.MathUtils.damp(cur.samRotX, tSamRotX, dampSpeed, dt);
      cur.samRotY = THREE.MathUtils.damp(cur.samRotY, tSamRotY, dampSpeed, dt);
      cur.samRotZ = THREE.MathUtils.damp(cur.samRotZ, tSamRotZ, dampSpeed, dt);
      cur.samScale = THREE.MathUtils.damp(cur.samScale, tSamScale, dampSpeed, dt);

      cur.brandX = THREE.MathUtils.damp(cur.brandX, tBrandX, dampSpeed, dt);
      cur.brandY = THREE.MathUtils.damp(cur.brandY, tBrandY, dampSpeed, dt);
      cur.brandZ = THREE.MathUtils.damp(cur.brandZ, tBrandZ, dampSpeed, dt);
      cur.brandRotX = THREE.MathUtils.damp(cur.brandRotX, tBrandRotX, dampSpeed, dt);
      cur.brandRotY = THREE.MathUtils.damp(cur.brandRotY, tBrandRotY, dampSpeed, dt);
      cur.brandRotZ = THREE.MathUtils.damp(cur.brandRotZ, tBrandRotZ, dampSpeed, dt);
      cur.brandScale = THREE.MathUtils.damp(cur.brandScale, tBrandScale, dampSpeed, dt);

      cur.tabX = THREE.MathUtils.damp(cur.tabX, tTabX, dampSpeed, dt);
      cur.tabY = THREE.MathUtils.damp(cur.tabY, tTabY, dampSpeed, dt);
      cur.tabZ = THREE.MathUtils.damp(cur.tabZ, tTabZ, dampSpeed, dt);
      cur.tabRotX = THREE.MathUtils.damp(cur.tabRotX, tTabRotX, dampSpeed, dt);
      cur.tabRotY = THREE.MathUtils.damp(cur.tabRotY, tTabRotY, dampSpeed, dt);
      cur.tabScale = THREE.MathUtils.damp(cur.tabScale, tTabScale, dampSpeed, dt);

      cur.shadowX = THREE.MathUtils.damp(cur.shadowX, tShadowX, dampSpeed, dt);
      cur.shadowOpacity = THREE.MathUtils.damp(cur.shadowOpacity, tShadowOpacity, dampSpeed, dt);

      devices.appleGroup.position.set(cur.appleX, cur.appleY, cur.appleZ);
      devices.appleGroup.rotation.set(cur.appleRotX, cur.appleRotY, cur.appleRotZ);
      devices.appleGroup.scale.setScalar(cur.appleScale);
      devices.appleGroup.visible = cur.appleScale > 0.02;

      devices.samsungGroup.position.set(cur.samX, cur.samY, cur.samZ);
      devices.samsungGroup.rotation.set(cur.samRotX, cur.samRotY, cur.samRotZ);
      devices.samsungGroup.scale.setScalar(cur.samScale);
      devices.samsungGroup.visible = cur.samScale > 0.02;

      devices.brandGroup.position.set(cur.brandX, cur.brandY, cur.brandZ);
      devices.brandGroup.rotation.set(cur.brandRotX, cur.brandRotY, cur.brandRotZ);
      devices.brandGroup.scale.setScalar(cur.brandScale);
      devices.brandGroup.visible = cur.brandScale > 0.02;

      devices.tabletsGroup.position.set(cur.tabX, cur.tabY, cur.tabZ);
      devices.tabletsGroup.rotation.set(cur.tabRotX, cur.tabRotY, 0);
      devices.tabletsGroup.scale.setScalar(cur.tabScale);
      devices.tabletsGroup.visible = cur.tabScale > 0.02;

      shadowPlane.position.x = cur.shadowX;
      shadowPlaneMat.opacity = cur.shadowOpacity;

      // Return whether motion is still settling
      const deltaSum =
        Math.abs(cur.appleX - tAppleX) +
        Math.abs(cur.appleRotY - tAppleRotY) +
        Math.abs(cur.appleScale - tAppleScale) +
        Math.abs(cur.samX - tSamX) +
        Math.abs(cur.samRotY - tSamRotY) +
        Math.abs(cur.samScale - tSamScale) +
        Math.abs(cur.brandX - tBrandX) +
        Math.abs(cur.brandRotY - tBrandRotY) +
        Math.abs(cur.brandScale - tBrandScale) +
        Math.abs(cur.tabY - tTabY) +
        Math.abs(cur.tabScale - tTabScale);

      return deltaSum > 0.004 || !reducedMotion;
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTimestamp) / 1000));
        lastTimestamp = now;

        const keepAnimating = computeTargets(dt, now / 1000);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (disposed) return;
          if (renderDirty || (keepAnimating && !isSoftwareGl)) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          if (keepAnimating && renderDirty) {
            afterDraw(done);
          } else {
            afterDraw(() => {
              renderBusy = false;
              if (!disposed && renderDirty) requestRender();
            });
          }
        } else {
          done();
        }
      });
    }

    triggerOnLoad = requestRender;
    registerTriggerRender(requestRender);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    window.addEventListener('resize', handleResize);
    requestRender();

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      devices.dispose();
      shadowPlane.geometry.dispose();
      shadowPlaneMat.dispose();
      shadowTex.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, [registerTriggerRender, reducedMotion, stageStateRef]);

  if (webglUnavailable) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white via-[#F5F6F8] to-[#E9EBEF]">
        <img
          src="/src/assets/images/horon_iphone_pro_1795008052838.jpg"
          alt="HORON PHONE Flagship Showcase"
          referrerPolicy="no-referrer"
          className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-xl"
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    />
  );
};
