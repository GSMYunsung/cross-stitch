import sharp from "sharp";

interface CheckedCell {
  r: number;
  c: number;
  color: string;
}

const SPEC = 20;
const CELL_SIZE = 20;
const GAP = 3;
const PADDING = 16;
const BG_COLOR = { r: 13, g: 13, b: 18, a: 255 }; // #0d0d12
const DEFAULT_CELL_COLOR = { r: 55, g: 60, b: 80, a: 255 }; // ~oklch(44.6% 0.043 257.281)

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
      a: 255,
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
    a: 255,
  };
}

function isHex(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.trim());
}

export async function generateGridImage(checkedCells: CheckedCell[]): Promise<Buffer> {
  const canvasSize = PADDING * 2 + SPEC * CELL_SIZE + (SPEC - 1) * GAP;
  const totalPixels = canvasSize * canvasSize;
  const raw = Buffer.alloc(totalPixels * 4);

  // fill background
  for (let i = 0; i < totalPixels; i++) {
    raw[i * 4] = BG_COLOR.r;
    raw[i * 4 + 1] = BG_COLOR.g;
    raw[i * 4 + 2] = BG_COLOR.b;
    raw[i * 4 + 3] = BG_COLOR.a;
  }

  // draw all cells (default color first)
  for (let row = 0; row < SPEC; row++) {
    for (let col = 0; col < SPEC; col++) {
      const cellX = PADDING + col * (CELL_SIZE + GAP);
      const cellY = PADDING + row * (CELL_SIZE + GAP);
      for (let py = 0; py < CELL_SIZE; py++) {
        for (let px = 0; px < CELL_SIZE; px++) {
          const pixelIdx = ((cellY + py) * canvasSize + (cellX + px)) * 4;
          raw[pixelIdx] = DEFAULT_CELL_COLOR.r;
          raw[pixelIdx + 1] = DEFAULT_CELL_COLOR.g;
          raw[pixelIdx + 2] = DEFAULT_CELL_COLOR.b;
          raw[pixelIdx + 3] = DEFAULT_CELL_COLOR.a;
        }
      }
    }
  }

  // draw checked cells
  const checkedMap = new Map<string, string>();
  for (const { r, c, color } of checkedCells) {
    checkedMap.set(`${r},${c}`, color);
  }

  for (const [key, color] of checkedMap.entries()) {
    const [row, col] = key.split(",").map(Number);
    const rgba = isHex(color) ? hexToRgba(color) : DEFAULT_CELL_COLOR;
    const cellX = PADDING + col * (CELL_SIZE + GAP);
    const cellY = PADDING + row * (CELL_SIZE + GAP);
    for (let py = 0; py < CELL_SIZE; py++) {
      for (let px = 0; px < CELL_SIZE; px++) {
        const pixelIdx = ((cellY + py) * canvasSize + (cellX + px)) * 4;
        raw[pixelIdx] = rgba.r;
        raw[pixelIdx + 1] = rgba.g;
        raw[pixelIdx + 2] = rgba.b;
        raw[pixelIdx + 3] = rgba.a;
      }
    }
  }

  return sharp(raw, {
    raw: { width: canvasSize, height: canvasSize, channels: 4 },
  })
    .png()
    .toBuffer();
}

export async function generateResetImage(): Promise<Buffer> {
  const canvasSize = PADDING * 2 + SPEC * CELL_SIZE + (SPEC - 1) * GAP;
  const totalPixels = canvasSize * canvasSize;
  const raw = Buffer.alloc(totalPixels * 4);

  for (let i = 0; i < totalPixels; i++) {
    raw[i * 4] = BG_COLOR.r;
    raw[i * 4 + 1] = BG_COLOR.g;
    raw[i * 4 + 2] = BG_COLOR.b;
    raw[i * 4 + 3] = BG_COLOR.a;
  }

  // draw faint empty cells
  for (let row = 0; row < SPEC; row++) {
    for (let col = 0; col < SPEC; col++) {
      const cellX = PADDING + col * (CELL_SIZE + GAP);
      const cellY = PADDING + row * (CELL_SIZE + GAP);
      for (let py = 0; py < CELL_SIZE; py++) {
        for (let px = 0; px < CELL_SIZE; px++) {
          const pixelIdx = ((cellY + py) * canvasSize + (cellX + px)) * 4;
          raw[pixelIdx] = 20;
          raw[pixelIdx + 1] = 20;
          raw[pixelIdx + 2] = 30;
          raw[pixelIdx + 3] = 255;
        }
      }
    }
  }

  const half = canvasSize / 2;
  const svg = Buffer.from(
    `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${half - 120}" y="${half - 70}" width="240" height="140" rx="14"
        fill="#13131a" stroke="#3730a3" stroke-width="1.5"/>
      <text x="${half}" y="${half - 28}" text-anchor="middle"
        fill="#6366f1" font-size="28" font-family="sans-serif">&#x21BA;</text>
      <text x="${half}" y="${half + 8}" text-anchor="middle"
        fill="#ffffff" font-size="15" font-weight="bold" font-family="sans-serif">Cross Stitch Reset</text>
      <text x="${half}" y="${half + 30}" text-anchor="middle"
        fill="#64748b" font-size="11" font-family="sans-serif">commit dropped below 30%</text>
      <text x="${half}" y="${half + 50}" text-anchor="middle"
        fill="#6366f1" font-size="11" font-family="sans-serif">visit CrossStitch to restart</text>
    </svg>`,
  );

  return sharp(raw, { raw: { width: canvasSize, height: canvasSize, channels: 4 } })
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toBuffer();
}
