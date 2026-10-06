"use client";

import * as React from "react";
import { Loader2, Download, Image as ImageIcon, Info, Check } from "lucide-react";
import { useHandOff } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { QrPreview } from "../qr-preview";
import { renderQrToCanvas, canvasToBlob } from "@/lib/qr-render";
import { saveOrShareBlob } from "@/lib/native-bridge";
import { STYLE_PRESETS } from "@/lib/style-presets";
import type { QrStyle } from "@/shared/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** A wallpaper art template — draws decorative art around the QR. */
interface ArtTemplate {
  id: string;
  name: string;
  bg: string; // background color
  accent: string; // art accent color
  fg: string; // text color
  /** draw the decorative art on the canvas (called BEFORE the QR is drawn) */
  draw: (ctx: CanvasRenderingContext2D, W: number, H: number, qrSize: number, qrX: number, qrY: number) => void;
}

const TEMPLATES: ArtTemplate[] = [
  {
    id: "sunburst",
    name: "Sunburst",
    bg: "#0E1B33",
    accent: "#C6FF00",
    fg: "#ECE7DE",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      const maxR = Math.hypot(W, H);
      ctx.save();
      ctx.translate(cx, cy);
      const rays = 36;
      for (let i = 0; i < rays; i++) {
        ctx.rotate((Math.PI * 2) / rays);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-30, maxR);
        ctx.lineTo(30, maxR);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "rgba(198,255,0,0.10)" : "rgba(198,255,0,0.04)";
        ctx.fill();
      }
      ctx.restore();
    },
  },
  {
    id: "halftone",
    name: "Halftone",
    bg: "#FBF9F5",
    accent: "#FF3B1F",
    fg: "#16161A",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // dotted halftone gradient field, denser at edges
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      const maxD = Math.hypot(W, H) / 2;
      for (let x = 20; x < W; x += 28) {
        for (let y = 20; y < H; y += 28) {
          const d = Math.hypot(x - cx, y - cy);
          const t = Math.min(1, d / maxD);
          const r = 2 + t * 7;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,59,31,${0.08 + t * 0.18})`;
          ctx.fill();
        }
      }
    },
  },
  {
    id: "checker",
    name: "Checkerboard",
    bg: "#1A0F2E",
    accent: "#C6FF00",
    fg: "#ECE7DE",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // checkerboard border frame around the whole canvas
      const tile = 48;
      const frame = 64;
      ctx.fillStyle = "#C6FF00";
      for (let x = 0; x < W; x += tile) {
        for (let y = 0; y < H; y += tile) {
          const inFrame = x < frame || x > W - frame || y < frame || y > H - frame;
          if (!inFrame) continue;
          if (((x / tile) + (y / tile)) % 2 === 0) {
            ctx.fillRect(x, y, tile, tile);
          }
        }
      }
      // accent: lime corner brackets at the QR corners
      const c = 36;
      ctx.strokeStyle = "#C6FF00";
      ctx.lineWidth = 8;
      [[qrX, qrY, 1, 1], [qrX + qrSize, qrY, -1, 1], [qrX, qrY + qrSize, 1, -1], [qrX + qrSize, qrY + qrSize, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * c);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * c, y);
        ctx.stroke();
      });
    },
  },
  {
    id: "confetti",
    name: "Confetti",
    bg: "#0F1F1A",
    accent: "#34D399",
    fg: "#ECE7DE",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      const colors = ["#34D399", "#C6FF00", "#F59E0B", "#EC4899", "#06B6D4"];
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      // seeded-ish random for consistency
      let seed = 7;
      const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      for (let i = 0; i < 160; i++) {
        const x = rand() * W;
        const y = rand() * H;
        // skip the QR area
        if (x > qrX - 20 && x < qrX + qrSize + 20 && y > qrY - 20 && y < qrY + qrSize + 20) continue;
        const c = colors[Math.floor(rand() * colors.length)];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rand() * Math.PI);
        ctx.fillStyle = c;
        const shape = rand();
        if (shape < 0.5) {
          ctx.fillRect(-4, -2, 8, 4); // rect
        } else if (shape < 0.8) {
          ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); // dot
        } else {
          // star
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const a = (j / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.lineTo(Math.cos(a) * 5, Math.sin(a) * 5);
            const a2 = a + Math.PI / 5;
            ctx.lineTo(Math.cos(a2) * 2, Math.sin(a2) * 2);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    },
  },
  {
    id: "orbs",
    name: "Orbs",
    bg: "#08080A",
    accent: "#1B2BE0",
    fg: "#EDEAE0",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // big soft gradient orbs behind the QR
      const orbs = [
        { x: W * 0.2, y: H * 0.2, r: 280, c: "rgba(27,43,224,0.35)" },
        { x: W * 0.85, y: H * 0.35, r: 320, c: "rgba(198,255,0,0.18)" },
        { x: W * 0.3, y: H * 0.75, r: 240, c: "rgba(255,59,31,0.22)" },
        { x: W * 0.8, y: H * 0.8, r: 200, c: "rgba(52,211,153,0.2)" },
      ];
      orbs.forEach((o) => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, o.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
    },
  },
  {
    id: "comic",
    name: "Comic",
    bg: "#FFF6DC",
    accent: "#0A0A0A",
    fg: "#0A0A0A",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // halftone dots + thick black outline + "BOOM" star burst behind QR
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      // yellow halftone bg
      for (let x = 0; x < W; x += 22) {
        for (let y = 0; y < H; y += 22) {
          const d = Math.hypot(x - cx, y - cy);
          const r = Math.max(0.5, 5 - d / 220);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,59,31,0.18)";
          ctx.fill();
        }
      }
      // star burst behind QR
      ctx.save();
      ctx.translate(cx, cy);
      const points = 24;
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const a = (i / (points * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? qrSize * 0.95 : qrSize * 0.72;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = "#FF3B1F";
      ctx.fill();
      ctx.strokeStyle = "#0A0A0A";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    },
  },
  // ===== Creative / character templates =====
  {
    id: "kawaii-cat",
    name: "Kawaii cat",
    bg: "#FFE8F0",
    accent: "#FF8FB1",
    fg: "#3A2A33",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // A cuter, more realistic kawaii cat peeking from behind the QR.
      // Drawn with softer shapes, bigger sparkly eyes, a muzzle, collar + bell, and a tail.
      const catColor = "#FBC4D6";
      const catLight = "#FDE8F0";
      const catDark = "#E8A0BD";
      const eyeColor = "#2A1F2A";
      const cheekColor = "rgba(255,120,160,0.4)";
      const innerEar = "#FFB0CC";
      const muzzleColor = "#FFF5F8";

      const cx = qrX + qrSize / 2;

      // ── Tail curling from the right side ──
      const tailBaseX = qrX + qrSize + qrSize * 0.05;
      const tailBaseY = qrY + qrSize * 0.55;
      ctx.save();
      ctx.fillStyle = catColor;
      ctx.strokeStyle = catDark;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tailBaseX, tailBaseY);
      ctx.quadraticCurveTo(tailBaseX + qrSize * 0.35, tailBaseY - qrSize * 0.1, tailBaseX + qrSize * 0.3, tailBaseY - qrSize * 0.45);
      ctx.quadraticCurveTo(tailBaseX + qrSize * 0.25, tailBaseY - qrSize * 0.5, tailBaseX + qrSize * 0.12, tailBaseY - qrSize * 0.42);
      ctx.quadraticCurveTo(tailBaseX + qrSize * 0.08, tailBaseY - qrSize * 0.2, tailBaseX, tailBaseY + qrSize * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // tail tip (lighter)
      ctx.fillStyle = catLight;
      ctx.beginPath();
      ctx.arc(tailBaseX + qrSize * 0.28, tailBaseY - qrSize * 0.43, qrSize * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── Cat head peeking from the TOP, behind the QR ──
      // Position so only the upper portion (ears + forehead + eyes) shows above the QR
      const headCx = cx;
      const headCy = qrY - qrSize * 0.28;
      const headR = qrSize * 0.48;
      const earR = headR * 0.45;

      // Ears (drawn first, behind head) — rounded triangles, more realistic
      ctx.fillStyle = catColor;
      [[-1], [1]].forEach(([dx]) => {
        const earCx = headCx + dx * headR * 0.6;
        const earCy = headCy - headR * 0.7;
        // outer ear — rounded triangle
        ctx.beginPath();
        ctx.moveTo(earCx - earR * 0.7, earCy + earR * 0.5);
        ctx.quadraticCurveTo(earCx - earR * 0.5, earCy - earR * 0.9, earCx, earCy - earR * 0.5);
        ctx.quadraticCurveTo(earCx + earR * 0.5, earCy - earR * 0.9, earCx + earR * 0.7, earCy + earR * 0.5);
        ctx.quadraticCurveTo(earCx, earCy + earR * 0.3, earCx - earR * 0.7, earCy + earR * 0.5);
        ctx.closePath();
        ctx.fill();
        // inner ear
        ctx.fillStyle = innerEar;
        ctx.beginPath();
        ctx.moveTo(earCx - earR * 0.35, earCy + earR * 0.25);
        ctx.quadraticCurveTo(earCx - earR * 0.25, earCy - earR * 0.4, earCx, earCy - earR * 0.15);
        ctx.quadraticCurveTo(earCx + earR * 0.25, earCy - earR * 0.4, earCx + earR * 0.35, earCy + earR * 0.25);
        ctx.quadraticCurveTo(earCx, earCy + earR * 0.15, earCx - earR * 0.35, earCy + earR * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = catColor;
      });

      // Head — slightly squircle (taller than wide) for a cuter look
      ctx.save();
      ctx.translate(headCx, headCy);
      ctx.scale(1, 1.08);
      ctx.beginPath();
      ctx.arc(0, 0, headR, 0, Math.PI * 2);
      ctx.fillStyle = catColor;
      ctx.fill();
      // soft shadow on the lower half for depth
      ctx.save();
      ctx.clip();
      const headGrad = ctx.createLinearGradient(0, -headR, 0, headR);
      headGrad.addColorStop(0, "rgba(255,255,255,0.15)");
      headGrad.addColorStop(0.6, "rgba(0,0,0,0)");
      headGrad.addColorStop(1, "rgba(160,80,120,0.18)");
      ctx.fillStyle = headGrad;
      ctx.fillRect(-headR, -headR, headR * 2, headR * 2);
      ctx.restore();
      ctx.restore();

      // Forehead stripe (tabby marking — adds realism)
      ctx.fillStyle = catDark;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(headCx, headCy - headR * 0.75);
      ctx.quadraticCurveTo(headCx - headR * 0.08, headCy - headR * 0.4, headCx, headCy - headR * 0.3);
      ctx.quadraticCurveTo(headCx + headR * 0.08, headCy - headR * 0.4, headCx, headCy - headR * 0.75);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Cheeks (blush)
      ctx.fillStyle = cheekColor;
      ctx.beginPath(); ctx.ellipse(headCx - headR * 0.48, headCy + headR * 0.18, headR * 0.2, headR * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(headCx + headR * 0.48, headCy + headR * 0.18, headR * 0.2, headR * 0.14, 0, 0, Math.PI * 2); ctx.fill();

      // Eyes — big, round, with gradient + double shine (kawaii style)
      [[-1], [1]].forEach(([dx]) => {
        const ex = headCx + dx * headR * 0.34;
        const ey = headCy + headR * 0.02;
        const eR = headR * 0.16;
        // eye socket (dark, gradient: top dark → bottom slightly lighter)
        const eyeGrad = ctx.createRadialGradient(ex, ey - eR * 0.3, eR * 0.2, ex, ey + eR * 0.2, eR);
        eyeGrad.addColorStop(0, "#4A3A4A");
        eyeGrad.addColorStop(1, eyeColor);
        ctx.fillStyle = eyeGrad;
        ctx.beginPath(); ctx.ellipse(ex, ey, eR * 0.85, eR, 0, 0, Math.PI * 2); ctx.fill();
        // big shine (top-left)
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath(); ctx.ellipse(ex - eR * 0.3, ey - eR * 0.35, eR * 0.32, eR * 0.42, -0.3, 0, Math.PI * 2); ctx.fill();
        // small shine (bottom-right)
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath(); ctx.arc(ex + eR * 0.25, ey + eR * 0.3, eR * 0.12, 0, Math.PI * 2); ctx.fill();
      });

      // Muzzle (small white puff under the eyes)
      ctx.fillStyle = muzzleColor;
      ctx.beginPath();
      ctx.ellipse(headCx, headCy + headR * 0.28, headR * 0.28, headR * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose (heart-shaped, cuter)
      const noseY = headCy + headR * 0.24;
      const noseS = headR * 0.06;
      ctx.fillStyle = "#E85A8A";
      ctx.beginPath();
      ctx.moveTo(headCx, noseY + noseS * 0.8);
      ctx.bezierCurveTo(headCx, noseY, headCx - noseS, noseY - noseS * 0.3, headCx - noseS * 0.5, noseY - noseS * 0.3);
      ctx.bezierCurveTo(headCx, noseY - noseS * 0.3, headCx, noseY, headCx, noseY + noseS * 0.2);
      ctx.bezierCurveTo(headCx, noseY, headCx + noseS, noseY - noseS * 0.3, headCx + noseS * 0.5, noseY - noseS * 0.3);
      ctx.bezierCurveTo(headCx + noseS, noseY - noseS * 0.3, headCx, noseY, headCx, noseY + noseS * 0.8);
      ctx.fill();

      // Mouth (w shape, soft)
      ctx.strokeStyle = "#9A6A7A";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(headCx - headR * 0.1, headCy + headR * 0.36);
      ctx.quadraticCurveTo(headCx - headR * 0.05, headCy + headR * 0.42, headCx, headCy + headR * 0.36);
      ctx.quadraticCurveTo(headCx + headR * 0.05, headCy + headR * 0.42, headCx + headR * 0.1, headCy + headR * 0.36);
      ctx.stroke();

      // Whiskers (softer, thinner)
      ctx.strokeStyle = "rgba(180,150,160,0.6)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      // left whiskers
      ctx.moveTo(headCx - headR * 0.22, headCy + headR * 0.25); ctx.quadraticCurveTo(headCx - headR * 0.6, headCy + headR * 0.18, headCx - headR * 0.65, headCy + headR * 0.12);
      ctx.moveTo(headCx - headR * 0.22, headCy + headR * 0.32); ctx.quadraticCurveTo(headCx - headR * 0.6, headCy + headR * 0.35, headCx - headR * 0.65, headCy + headR * 0.32);
      // right whiskers
      ctx.moveTo(headCx + headR * 0.22, headCy + headR * 0.25); ctx.quadraticCurveTo(headCx + headR * 0.6, headCy + headR * 0.18, headCx + headR * 0.65, headCy + headR * 0.12);
      ctx.moveTo(headCx + headR * 0.22, headCy + headR * 0.32); ctx.quadraticCurveTo(headCx + headR * 0.6, headCy + headR * 0.35, headCx + headR * 0.65, headCy + headR * 0.32);
      ctx.stroke();

      // ── Two paws peeking from the BOTTOM of the QR (cuter, with toe beans) ──
      const pawY = qrY + qrSize + qrSize * 0.1;
      const pawR = qrSize * 0.16;
      [[-1], [1]].forEach(([dx]) => {
        const px = cx + dx * qrSize * 0.26;
        // paw shape (rounded, slightly squashed)
        ctx.fillStyle = catColor;
        ctx.beginPath();
        ctx.ellipse(px, pawY, pawR * 1.05, pawR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        // toe beans (4 small pads)
        ctx.fillStyle = "#FFB8CE";
        const beanR = pawR * 0.2;
        ctx.beginPath(); ctx.arc(px - pawR * 0.42, pawY - pawR * 0.15, beanR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px - pawR * 0.14, pawY - pawR * 0.3, beanR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + pawR * 0.14, pawY - pawR * 0.3, beanR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + pawR * 0.42, pawY - pawR * 0.15, beanR, 0, Math.PI * 2); ctx.fill();
        // main pad (bigger, heart-ish)
        ctx.fillStyle = "#FF9AB8";
        ctx.beginPath();
        ctx.ellipse(px, pawY + pawR * 0.35, pawR * 0.45, pawR * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Floating hearts (more, varied sizes) ──
      const drawHeart = (x: number, y: number, s: number, color: string, alpha: number) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.7);
        ctx.bezierCurveTo(x - s * 1.2, y - s * 0.2, x - s * 0.4, y - s, x, y - s * 0.3);
        ctx.bezierCurveTo(x + s * 0.4, y - s, x + s * 1.2, y - s * 0.2, x, y + s * 0.7);
        ctx.fill();
        ctx.restore();
      };
      drawHeart(qrX - qrSize * 0.08, qrY + qrSize * 0.12, 16, "#FF8FB1", 0.7);
      drawHeart(qrX + qrSize + qrSize * 0.06, qrY + qrSize * 0.25, 22, "#FF6FA0", 0.6);
      drawHeart(qrX + qrSize * 0.05, qrY + qrSize + qrSize * 0.22, 14, "#FFB0CC", 0.7);
      drawHeart(qrX - qrSize * 0.1, qrY + qrSize * 0.6, 10, "#FF8FB1", 0.5);
      drawHeart(qrX + qrSize + qrSize * 0.1, qrY + qrSize * 0.7, 12, "#FF6FA0", 0.6);

      // ── Sparkles ──
      const drawSparkle = (x: number, y: number, s: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s * 0.3, y - s * 0.3);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x + s * 0.3, y + s * 0.3);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x - s * 0.3, y + s * 0.3);
        ctx.lineTo(x - s, y);
        ctx.lineTo(x - s * 0.3, y - s * 0.3);
        ctx.closePath();
        ctx.fill();
      };
      drawSparkle(qrX - qrSize * 0.12, qrY + qrSize * 0.3, 8, "rgba(255,215,0,0.6)");
      drawSparkle(qrX + qrSize + qrSize * 0.08, qrY + qrSize * 0.5, 6, "rgba(255,215,0,0.5)");
      drawSparkle(qrX + qrSize * 0.5, qrY - qrSize * 0.05, 5, "rgba(255,255,255,0.7)");
    },
  },
  {
    id: "clouds",
    name: "Clouds",
    bg: "#A8D8F0",
    accent: "#FFFFFF",
    fg: "#1A3A5C",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // soft white clouds drifting across a sky-blue bg, sun in a corner
      const drawCloud = (cx: number, cy: number, s: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx - s, cy, s * 0.7, 0, Math.PI * 2);
        ctx.arc(cx + s, cy, s * 0.7, 0, Math.PI * 2);
        ctx.arc(cx, cy - s * 0.5, s * 0.9, 0, Math.PI * 2);
        ctx.arc(cx, cy + s * 0.2, s, 0, Math.PI * 2);
        ctx.fill();
      };
      // sun (top-right)
      const sunX = W - 140, sunY = 180;
      ctx.fillStyle = "#FFE066";
      ctx.beginPath(); ctx.arc(sunX, sunY, 70, 0, Math.PI * 2); ctx.fill();
      // sun rays
      ctx.strokeStyle = "#FFE066";
      ctx.lineWidth = 8;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(a) * 85, sunY + Math.sin(a) * 85);
        ctx.lineTo(sunX + Math.cos(a) * 115, sunY + Math.sin(a) * 115);
        ctx.stroke();
      }
      // clouds
      drawCloud(W * 0.2, H * 0.12, 60, "#FFFFFF");
      drawCloud(W * 0.75, H * 0.28, 70, "rgba(255,255,255,0.85)");
      drawCloud(W * 0.15, H * 0.55, 55, "rgba(255,255,255,0.9)");
      drawCloud(W * 0.85, H * 0.7, 65, "rgba(255,255,255,0.8)");
      drawCloud(W * 0.5, H * 0.88, 75, "rgba(255,255,255,0.75)");
      // grass at the bottom
      ctx.fillStyle = "#7BC97F";
      ctx.fillRect(0, H - 120, W, 120);
      // little grass blades
      ctx.strokeStyle = "#5BA85F";
      ctx.lineWidth = 4;
      for (let x = 10; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, H - 120);
        ctx.lineTo(x + 6, H - 145);
        ctx.stroke();
      }
    },
  },
  {
    id: "mountains",
    name: "Mountains",
    bg: "#1E2A4A",
    accent: "#C6FF00",
    fg: "#ECE7DE",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // moon
      ctx.fillStyle = "#F5F3E8";
      ctx.beginPath(); ctx.arc(W - 160, 200, 60, 0, Math.PI * 2); ctx.fill();
      // moon craters
      ctx.fillStyle = "rgba(180,175,160,0.4)";
      ctx.beginPath(); ctx.arc(W - 180, 190, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W - 140, 220, 8, 0, Math.PI * 2); ctx.fill();
      // stars
      ctx.fillStyle = "#FFFFFF";
      const stars = [[100, 150], [300, 100], [500, 180], [800, 120], [200, 300], [900, 280], [60, 400], [950, 400]];
      stars.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
      });
      // mountain layers (back to front)
      const drawMountain = (points: [number, number][], color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, H);
        points.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      };
      drawMountain([[0, H * 0.55], [W * 0.2, H * 0.4], [W * 0.4, H * 0.5], [W * 0.6, H * 0.38], [W * 0.8, H * 0.48], [W, H * 0.42]], "#2E3B5C");
      drawMountain([[0, H * 0.7], [W * 0.15, H * 0.58], [W * 0.35, H * 0.65], [W * 0.55, H * 0.55], [W * 0.75, H * 0.62], [W, H * 0.58]], "#1A2440");
      drawMountain([[0, H * 0.82], [W * 0.25, H * 0.72], [W * 0.5, H * 0.78], [W * 0.75, H * 0.7], [W, H * 0.76]], "#0E1730");
      // snow caps on front mountains
      ctx.fillStyle = "#ECE7DE";
      ctx.beginPath();
      ctx.moveTo(W * 0.7, H * 0.7);
      ctx.lineTo(W * 0.75, H * 0.7);
      ctx.lineTo(W * 0.725, H * 0.74);
      ctx.fill();
    },
  },
  {
    id: "bubbles",
    name: "Bubbles",
    bg: "#0A2A3A",
    accent: "#22D3EE",
    fg: "#E0F7FF",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // floating translucent bubbles
      const bubbles = [
        { x: 120, y: 300, r: 80, c: "rgba(34,211,238,0.18)" },
        { x: W - 100, y: 500, r: 110, c: "rgba(167,139,250,0.16)" },
        { x: 180, y: 900, r: 60, c: "rgba(34,211,238,0.2)" },
        { x: W - 200, y: 1100, r: 90, c: "rgba(244,114,182,0.16)" },
        { x: W * 0.5, y: 1500, r: 100, c: "rgba(34,211,238,0.14)" },
        { x: 100, y: 1600, r: 50, c: "rgba(167,139,250,0.2)" },
        { x: W - 120, y: 1750, r: 70, c: "rgba(34,211,238,0.18)" },
      ];
      bubbles.forEach((b) => {
        // bubble fill
        ctx.fillStyle = b.c;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        // bubble outline
        ctx.strokeStyle = "rgba(224,247,255,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
        // shine
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.18, b.r * 0.28, -0.5, 0, Math.PI * 2); ctx.fill();
      });
    },
  },
  {
    id: "vines",
    name: "Vines",
    bg: "#F5F0E6",
    accent: "#2E6B45",
    fg: "#1A3A2E",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // climbing vines with leaves on left + right edges
      const drawVine = (startX: number, dir: 1 | -1) => {
        let x = startX;
        let y = H;
        ctx.strokeStyle = "#5A3A1F";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const steps = 16;
        for (let i = 0; i < steps; i++) {
          y -= H / steps;
          x += dir * (i % 2 === 0 ? 50 : -50);
          ctx.quadraticCurveTo(x + dir * 30, y + 40, x, y);
        }
        ctx.stroke();
        // leaves along the vine
        let ly = H;
        let lx = startX;
        for (let i = 0; i < steps; i++) {
          ly -= H / steps;
          lx += dir * (i % 2 === 0 ? 50 : -50);
          const leafSize = 22 + (i % 3) * 6;
          ctx.fillStyle = i % 2 === 0 ? "#2E6B45" : "#3F8556";
          ctx.save();
          ctx.translate(lx + dir * 25, ly);
          ctx.rotate(dir * (0.3 + (i % 2) * 0.4));
          ctx.beginPath();
          ctx.ellipse(0, 0, leafSize, leafSize * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };
      drawVine(70, 1);
      drawVine(W - 70, -1);
      // a few scattered flowers
      const flowers = [[150, 250, "#FF6B9D"], [W - 130, 600, "#FFD93D"], [120, 1200, "#FF6B9D"], [W - 100, 1500, "#A78BFA"]];
      flowers.forEach(([fx, fy, fc]) => {
        // petals
        ctx.fillStyle = fc as string;
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * 14, fy + Math.sin(a) * 14, 12, 0, Math.PI * 2);
          ctx.fill();
        }
        // center
        ctx.fillStyle = "#FFE066";
        ctx.beginPath(); ctx.arc(fx, fy, 9, 0, Math.PI * 2); ctx.fill();
      });
    },
  },
];

/** QR color presets that pair well with the templates. */
const WALLPAPER_QR_IDS = ["ink", "aurora", "lagoon", "sunset-strip", "royal-jade", "neon-pulse"];

/** Renders the template art to a canvas for the phone preview (live).
 *  Scales the 1080×1920 template draw to the 220×440 preview size. */
function WallpaperArtPreview({ template }: { template: ArtTemplate }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const PW = 220;
  const PH = 440;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // render at 2x for crispness
    canvas.width = PW * 2;
    canvas.height = PH * 2;
    ctx.scale(2, 2);

    // clear + fill bg
    ctx.fillStyle = template.bg;
    ctx.fillRect(0, 0, PW, PH);

    // scale the template draw from 1080×1920 → 220×440
    const scaleX = PW / 1080;
    const scaleY = PH / 1920;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    // QR band in the 36%-80% range, qrSize = W*0.56
    const qrSize = Math.round(1080 * 0.56);
    const qrX = (1080 - qrSize) / 2;
    const qrY = Math.round(1920 * 0.36);
    template.draw(ctx, 1080, 1920, qrSize, qrX, qrY);
    ctx.restore();
  }, [template]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ width: PW, height: PH }}
      aria-hidden="true"
    />
  );
}

export function WallpaperScreen() {
  const { card, style, photo } = useHandOff();
  const { navigate } = useView();
  const [busy, setBusy] = React.useState(false);
  const [templateId, setTemplateId] = React.useState<string>(TEMPLATES[0].id);
  const [qrPresetId, setQrPresetId] = React.useState<string>("ink");

  const wallpaperPresets = React.useMemo(
    () => WALLPAPER_QR_IDS.map((id) => STYLE_PRESETS.find((p) => p.id === id)).filter(Boolean) as typeof STYLE_PRESETS,
    []
  );
  const activeTemplate = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const activeQrPreset = wallpaperPresets.find((p) => p.id === qrPresetId) ?? wallpaperPresets[0];
  const wallpaperStyle: QrStyle = activeQrPreset?.style ?? style;

  if (!card) return null;

  const W = 1080;
  const H = 1920;

  async function generate() {
    if (!card) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // backdrop
      ctx.fillStyle = activeTemplate.bg;
      ctx.fillRect(0, 0, W, H);

      // QR plate in the 36%-80% band
      const qrSize = Math.round(W * 0.56);
      const qrX = (W - qrSize) / 2;
      const qrY = Math.round(H * 0.36);

      // draw template art (behind QR)
      activeTemplate.draw(ctx, W, H, qrSize, qrX, qrY);

      // QR
      const qrCanvas = document.createElement("canvas");
      await renderQrToCanvas(qrCanvas, card, wallpaperStyle, qrSize, photo?.full);
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // name + title beneath, inside band
      ctx.fillStyle = activeTemplate.fg;
      await document.fonts.load('500 48px "Fraunces"');
      ctx.textAlign = "center";
      const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
      if (name) {
        ctx.font = '500 56px "Fraunces", serif';
        ctx.fillText(name.slice(0, 24), W / 2, qrY + qrSize + 90);
      }
      if (card.jobTitle) {
        ctx.font = '400 32px "Instrument Sans", sans-serif';
        ctx.fillText(card.jobTitle.slice(0, 40), W / 2, qrY + qrSize + 140);
      }

      const blob = await canvasToBlob(canvas, "image/png");
      const result = await saveOrShareBlob(
        blob,
        `${card.firstName || "contact"}-wallpaper.png`,
        "HandOff wallpaper",
        "Here's my wallpaper"
      );
      toast.success(result === "shared" ? "Wallpaper shared" : result === "saved" ? "Wallpaper saved" : "Wallpaper downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader title="Wallpaper" onBack={() => navigate("home")} helpGuideId="wallpaper-apply" />
      <div className="px-5 pb-28 pt-4">
        {/* intro */}
        <div className="brut p-5">
          <div className="flex items-center gap-2">
            <span className="brut-signal flex h-7 w-7 items-center justify-center">
              <ImageIcon className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <h2 className="font-heavy text-[15px] uppercase tracking-wide">Lock-screen wallpaper</h2>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Pick an art template, then a QR color. Your QR sits inside the design,
            clear of the clock and shortcuts. Download and set it as your lock screen.
          </p>
        </div>

        {/* phone preview */}
        <div className="mt-5 flex justify-center">
          <div
            className="relative overflow-hidden border-[3px] border-ink shadow-[5px_5px_0_0_var(--ink)]"
            style={{ width: 220, height: 440, background: activeTemplate.bg, borderRadius: 24 }}
          >
            {/* template art — rendered live to canvas */}
            <WallpaperArtPreview template={activeTemplate} />
            {/* faux clock */}
            <div className="absolute left-0 right-0 top-6 z-10 flex flex-col items-center">
              <span className="font-display text-5xl font-light leading-none" style={{ color: activeTemplate.fg }}>
                9:41
              </span>
              <span
                className="mt-1 text-[9px] uppercase tracking-[0.18em]"
                style={{ color: activeTemplate.fg, opacity: 0.6 }}
              >
                {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            {/* QR */}
            <div className="absolute left-1/2 top-[36%] z-10 -translate-x-1/2 border-2 border-ink bg-white p-1.5" style={{ borderRadius: 24 }}>
              <QrPreview card={card} style={wallpaperStyle} size={120} photoDataUrl={photo?.full} showLoading={false} />
            </div>
            {/* name */}
            <div className="absolute left-1/2 top-[72%] z-10 -translate-x-1/2 text-center" style={{ color: activeTemplate.fg }}>
              <p className="font-display text-sm font-medium uppercase tracking-wide leading-tight">
                {[card.firstName, card.lastName].filter(Boolean).join(" ")}
              </p>
              {card.jobTitle && <p className="mt-0.5 text-[9px] opacity-70">{card.jobTitle}</p>}
            </div>
          </div>
        </div>

        {/* art template picker */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 border-b-2 border-ink pb-1">
            <span className="h-1.5 w-1.5 bg-signal" />
            <p className="field-label font-bold text-foreground">Art template</p>
            <span className="field-label text-muted-foreground">{TEMPLATES.length} designs</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={cn(
                  "press no-tap relative flex flex-col items-center gap-1.5 border-2 border-ink p-2 shadow-[2px_2px_0_0_var(--ink)]",
                  templateId === t.id && "ring-2 ring-signal ring-offset-1 ring-offset-background"
                )}
                style={{ background: t.bg, borderRadius: 10 }}
                aria-label={t.name}
                aria-pressed={templateId === t.id}
              >
                {/* mini preview swatch */}
                <span
                  className="flex h-10 w-full items-center justify-center"
                  style={{ background: t.bg, borderRadius: 10 }}
                >
                  <span className="h-4 w-4" style={{ background: t.accent, borderRadius: 2 }} />
                </span>
                <span className="w-full truncate text-center text-[10px] font-bold uppercase tracking-wide" style={{ color: t.fg }}>
                  {t.name}
                </span>
                {templateId === t.id && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center border border-ink bg-signal">
                    <Check className="h-2.5 w-2.5 text-black" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 field-label leading-relaxed">
            Active: <span className="font-bold text-foreground">{activeTemplate.name}</span> · Tap to change
          </p>
        </div>

        {/* QR color picker */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 border-b-2 border-ink pb-1">
            <span className="h-1.5 w-1.5 bg-signal" />
            <p className="field-label font-bold text-foreground">QR color</p>
            <span className="field-label text-muted-foreground">{wallpaperPresets.length} looks</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {wallpaperPresets.map((p) => (
              <button
                key={p.id}
                onClick={() => setQrPresetId(p.id)}
                className={cn(
                  "press no-tap relative flex flex-col items-center gap-1 border-2 border-ink bg-card p-1.5 shadow-[2px_2px_0_0_var(--ink)]",
                  qrPresetId === p.id && "ring-2 ring-signal ring-offset-1 ring-offset-background"
                )}
                style={{ borderRadius: 10 }}
                aria-label={p.name}
                aria-pressed={qrPresetId === p.id}
              >
                <div className="aspect-square w-full overflow-hidden border border-ink" style={{ borderRadius: 10 }}>
                  <QrPreview card={card} style={p.style} size={56} photoDataUrl={photo?.full} showLoading={false} />
                </div>
                <span className="w-full truncate text-center text-[9px] font-bold uppercase tracking-wide text-foreground">
                  {p.name}
                </span>
                {qrPresetId === p.id && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center border border-ink bg-signal">
                    <Check className="h-2.5 w-2.5 text-black" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* download button */}
        <button
          onClick={generate}
          disabled={busy}
          className={cn(
            "press no-tap mt-6 flex w-full items-center justify-center gap-2 border-[2.5px] border-ink bg-signal py-4 font-heavy text-[15px] uppercase tracking-wide text-black shadow-[5px_5px_0_0_var(--ink)] disabled:opacity-50"
          )}
          style={{ borderRadius: 14 }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Download className="h-4 w-4" strokeWidth={2.5} />}
          Download wallpaper
        </button>

        {/* info */}
        <div className="mt-5 flex gap-2 border-2 border-ink bg-card p-3 shadow-[2px_2px_0_0_var(--ink)]" style={{ borderRadius: 10 }}>
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay" strokeWidth={2.5} />
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            On Android, open the image and set it as your lock-screen wallpaper. On
            iOS, save to Photos then set it via Settings → Wallpaper. Some
            manufacturers override lock-screen wallpapers with their own theming.
          </p>
        </div>
      </div>
    </div>
  );
}
