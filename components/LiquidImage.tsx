"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * LiquidImage — an image that ripples like water under the cursor.
 *
 * ⚠️ INVENTED INTERACTION. This is not in the Figma or the brief — it is a
 * deliberate addition, and belongs in MOTION_SPEC.md (D6) as one.
 *
 * ── Why WebGL ─────────────────────────────────────────────────────────────────
 * Real ripple is per-pixel displacement: each pixel samples the texture from a
 * position offset by a travelling wave. CSS cannot do that at all, and SVG
 * `feDisplacementMap` gets expensive on large images. This is hand-rolled WebGL
 * rather than three.js — the whole shader is ~30 lines, so a 150KB library for one
 * effect is not a trade worth making.
 *
 * ── The context is created ON HOVER, not on mount ─────────────────────────────
 * ⚠️ This is the load-bearing decision in this file. Browsers cap a PAGE at ~16
 * live WebGL contexts and silently kill the oldest ones past that — a killed
 * canvas paints as a broken/"sad" icon. The hero arch alone renders 8 of these
 * (5 desktop + 3 mobile, both in the DOM), and React StrictMode mounts every
 * effect twice in dev, so a context-per-instance blew the cap and the images
 * died. Do NOT move this back to mount time or add a second permanent context.
 *
 * Since the plain <img> IS the rest state, a context is only needed while the
 * pointer is actually over the image. So one is built on `pointerenter` and torn
 * down once the water settles — at most one or two alive at any moment, however
 * many of these are on the page.
 *
 * The texture is uploaded from the rendered <img> itself, so hovering costs no
 * extra network request and there is no CORS mode to mismatch.
 *
 * ── The shader ────────────────────────────────────────────────────────────────
 * Displacement = a radial wave emanating from the pointer, falling off
 * exponentially with distance. `strength` eases 0 -> 1 on enter and back on leave,
 * so the water settles rather than snapping flat.
 *
 * The same `strength` also drives a 6% ZOOM, sampled in the shader — so the image
 * expands INSIDE its frame rather than the card growing, and the zoom and the
 * ripple are inseparable by construction rather than two timed animations.
 *
 * At strength 0 the shader output is the plain cover-fitted image, so swapping
 * the <img> for the canvas on enter (and back on leave) is invisible.
 *
 * ── Falls back to the plain <img> when ────────────────────────────────────────
 *   - `prefers-reduced-motion` is set  (CLAUDE.md §5)
 *   - the pointer is coarse (touch) — there is no cursor to follow
 *   - WebGL is unavailable, or the image has not decoded yet
 * The fallback keeps a CSS zoom so the hover still reads, and the static image is
 * the rest state, so nothing is lost.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform float uTime;
uniform float uStrength;
uniform float uQuadAspect;
uniform float uImgAspect;

void main() {
  // object-cover: scale the sampled area so the image fills the quad.
  float ratio = uQuadAspect / uImgAspect;
  vec2 scale = ratio > 1.0 ? vec2(1.0, 1.0 / ratio) : vec2(ratio, 1.0);

  // Zoom on hover — sampling a SMALLER region magnifies the image inside the
  // frame, so it expands within the border rather than the card growing.
  // Driven by the same eased uStrength, so zoom and ripple move as one.
  float zoom = 1.0 + uStrength * 0.06;
  vec2 uv = (vUv - 0.5) * scale / zoom + 0.5;

  // Distance from the pointer, corrected for aspect so ripples stay circular.
  vec2 d = vUv - uMouse;
  d.x *= uQuadAspect;
  float dist = length(d);

  // A wave travelling outward, fading with distance.
  float falloff = exp(-dist * 4.0);
  float wave = sin(dist * 28.0 - uTime * 4.5);
  vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
  vec2 offset = dir * wave * falloff * uStrength * 0.035;

  gl_FragColor = texture2D(uTex, uv + offset);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

/** A live ripple session: one WebGL context, alive only while hovered. */
type Ripple = {
  move(x: number, y: number): void;
  release(): void;
  destroy(): void;
};

/**
 * Build a context and start rippling from (x, y). `onSettled` fires once the
 * water is flat again so the caller can drop the context.
 */
function createRipple(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  x: number,
  y: number,
  onSettled: () => void,
): Ripple | null {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) return null;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTex = gl.getUniformLocation(prog, "uTex");
  const uMouse = gl.getUniformLocation(prog, "uMouse");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uStrength = gl.getUniformLocation(prog, "uStrength");
  const uQuadAspect = gl.getUniformLocation(prog, "uQuadAspect");
  const uImgAspect = gl.getUniformLocation(prog, "uImgAspect");

  // Texture straight from the already-decoded <img> — no second request.
  //
  // FLIP_Y is required, not optional. GL's texture origin is bottom-left and an
  // HTML image's is top-left, so uploading raw renders the image upside down.
  // `vUv.y = 0` is the BOTTOM of the quad, and the pointer maths below already
  // works in that bottom-up space, so flipping the texture is what makes the two
  // agree — do not "fix" an inversion by negating the mouse instead.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

  const imgAspect = img.naturalWidth / img.naturalHeight || 1;
  let quadAspect = 1;

  function resize() {
    // Cap DPR at 2 — beyond that the extra pixels are invisible and the fill
    // rate cost is real.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    quadAspect = r.width / r.height;
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const mouse = { x, y };
  const target = { x, y };
  let strength = 0;
  let targetStrength = 1;
  let raf = 0;
  let dead = false;
  const start = performance.now();

  function draw(t: number) {
    gl!.useProgram(prog);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.uniform1i(uTex, 0);
    gl!.uniform2f(uMouse, mouse.x, mouse.y);
    gl!.uniform1f(uTime, t);
    gl!.uniform1f(uStrength, strength);
    gl!.uniform1f(uQuadAspect, quadAspect);
    gl!.uniform1f(uImgAspect, imgAspect);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function frame() {
    if (dead) return;
    // Ease the pointer and the strength — the water lags the cursor slightly.
    mouse.x += (target.x - mouse.x) * 0.12;
    mouse.y += (target.y - mouse.y) * 0.12;
    strength += (targetStrength - strength) * 0.07;

    draw((performance.now() - start) / 1000);

    // Flat and released: hand back to the <img> and free the context.
    if (targetStrength === 0 && strength < 0.002) {
      onSettled();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  // Paint the flat frame BEFORE the caller reveals the canvas, so the handover
  // from the <img> never shows an empty surface.
  draw(0);
  raf = requestAnimationFrame(frame);

  return {
    move(nx, ny) {
      target.x = nx;
      target.y = ny;
    },
    release() {
      targetStrength = 0;
    },
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl!.deleteTexture(tex);
      gl!.deleteBuffer(buf);
      gl!.deleteProgram(prog);
      // Free the context eagerly, then throw the canvas away entirely.
      //
      // ⚠️ Discarding the ELEMENT is the point. `loseContext()` permanently
      // poisons the canvas it is called on — a canvas that has lost its context
      // will never hand out a working one again, so reusing the same element
      // meant the second hover got a dead context and painted the broken icon.
      // Every session therefore gets a brand-new canvas.
      gl!.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}

export interface LiquidImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function LiquidImage({ src, alt = "", className }: LiquidImageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const host = hostRef.current;
    const layer = layerRef.current;
    if (!host || !layer) return;

    let ripple: Ripple | null = null;
    /** Set if WebGL refuses once, so we stop retrying on every mousemove. */
    let unsupported = false;

    /** Pointer position in 0–1 texture space (WebGL's y axis runs bottom-up). */
    function uv(e: PointerEvent) {
      const r = host!.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width,
        y: 1 - (e.clientY - r.top) / r.height,
      };
    }

    function drop() {
      ripple?.destroy();
      ripple = null;
      setActive(false);
    }

    function onEnter(e: PointerEvent) {
      if (ripple || unsupported) return;
      const img = imgRef.current;
      // Not decoded yet — no texture to upload. The CSS zoom still runs.
      if (!img?.complete || !img.naturalWidth) return;

      // A FRESH canvas per session — see the note in `destroy`.
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      // Inline, not Tailwind: this element is created imperatively and has no
      // JSX for classes to live on. It is three layout properties, not styling.
      canvas.style.cssText = "display:block;width:100%;height:100%";
      layer!.appendChild(canvas);

      const p = uv(e);
      ripple = createRipple(host!, canvas, img, p.x, p.y, drop);
      if (!ripple) {
        canvas.remove();
        unsupported = true;
        return;
      }
      setActive(true);
    }

    function onMove(e: PointerEvent) {
      if (!ripple) {
        // Covers entering via a scroll or a tab-away/return, where no
        // pointerenter fires.
        onEnter(e);
        return;
      }
      const p = uv(e);
      ripple.move(p.x, p.y);
    }

    function onLeave() {
      ripple?.release();
    }

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      ripple?.destroy();
      ripple = null;
    };
  }, [src]);

  return (
    <div ref={hostRef} className={cn("group relative size-full overflow-hidden", className)}>
      {/* The rest state, and the texture source. Always mounted — it is what the
          canvas is built FROM, so it can never be swapped for a placeholder. */}
      {/* TODO(D9): next/image. */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "size-full object-cover transition-transform duration-slower ease-out-back",
          // Without WebGL this zoom IS the hover, so it stays — but it is
          // suppressed while the shader is running so the two cannot compound.
          !active && "group-hover:scale-105 group-hover:duration-slow group-hover:ease-cta-expand",
        )}
      />
      {/* The canvas is appended here imperatively and thrown away after each
          hover, so React must not own it. Empty at rest.
          The image is never hidden — the canvas is opaque and covers it exactly,
          so it is simply occluded. That matters: the canvas is removed
          synchronously while a React state change is not, so fading the image
          out would race the removal and flash a blank frame on the way back. */}
      <div ref={layerRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
    </div>
  );
}
