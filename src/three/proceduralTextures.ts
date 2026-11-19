import * as THREE from 'three';

export function createOledScreenTexture(
  variant: 'apple' | 'samsung' | 'tecno' | 'infinix' | 'xiaomi' | 'ipad' | 'tab',
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const isTablet = variant === 'ipad' || variant === 'tab';
  const width = isTablet ? 768 : 512;
  const height = isTablet ? 1024 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep architectural obsidian base
    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    if (variant === 'apple' || variant === 'ipad') {
      baseGrad.addColorStop(0, '#0E121B');
      baseGrad.addColorStop(0.45, '#17233B');
      baseGrad.addColorStop(1, '#090B10');
    } else if (variant === 'samsung' || variant === 'tab') {
      baseGrad.addColorStop(0, '#0B0F17');
      baseGrad.addColorStop(0.5, '#13274A');
      baseGrad.addColorStop(1, '#0A0D13');
    } else if (variant === 'tecno' || variant === 'infinix') {
      baseGrad.addColorStop(0, '#10141D');
      baseGrad.addColorStop(0.5, '#1A2D4D');
      baseGrad.addColorStop(1, '#0B0E14');
    } else {
      baseGrad.addColorStop(0, '#0C0F16');
      baseGrad.addColorStop(0.5, '#1D2432');
      baseGrad.addColorStop(1, '#080A0E');
    }
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle luminous architectural arcs
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const cx = width * (0.25 + i * 0.18);
      const cy = height * (0.42 + (i % 2) * 0.14);
      const radius = width * (0.55 + i * 0.14);
      const radGrad = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius);
      if (i % 2 === 0) {
        radGrad.addColorStop(0, 'rgba(23, 105, 224, 0.34)');
        radGrad.addColorStop(0.55, 'rgba(23, 105, 224, 0.08)');
        radGrad.addColorStop(1, 'rgba(23, 105, 224, 0)');
      } else {
        radGrad.addColorStop(0, 'rgba(226, 232, 240, 0.22)');
        radGrad.addColorStop(0.6, 'rgba(148, 163, 184, 0.05)');
        radGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      }
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Precision architectural ribbon curves
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = isTablet ? 2.5 : 2;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(-40, height * (0.34 + j * 0.08));
      ctx.bezierCurveTo(
        width * 0.3,
        height * (0.24 + j * 0.06),
        width * 0.65,
        height * (0.58 - j * 0.05),
        width + 40,
        height * (0.42 + j * 0.07),
      );
      ctx.stroke();
    }
    ctx.restore();

    // Minimalist glass reflection highlight
    const sheen = ctx.createLinearGradient(0, 0, width * 0.85, height * 0.55);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
    sheen.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    // Subtle crisp minimal time indicator on lock screen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.font = `600 ${isTablet ? 92 : 76}px "Sora", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('09:41', width / 2, isTablet ? 190 : 210);

    // Bottom home indicator bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const barW = width * 0.34;
    const barH = 6;
    const barX = (width - barW) / 2;
    const barY = height - 28;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.04,
      size / 2,
      size / 2,
      size * 0.48,
    );
    grad.addColorStop(0, 'rgba(17, 19, 24, 0.24)');
    grad.addColorStop(0.45, 'rgba(17, 19, 24, 0.10)');
    grad.addColorStop(1, 'rgba(17, 19, 24, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createBrushedMetalRoughnessTexture(): THREE.CanvasTexture {
  const width = 256;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#383838';
    ctx.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 2) {
      const shade = 48 + ((y * 17) % 28);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, width, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}
