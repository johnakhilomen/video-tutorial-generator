import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import { LAYOUT } from "../utils/layout.js";

/** Animated gradient orb background element */
export const GradientOrb: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}> = ({ x, y, size, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 40 },
  });

  const float = Math.sin((frame + delay) / 30) * 10;

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2 + float,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: 0.3 * scale,
        transform: `scale(${scale})`,
        filter: "blur(40px)",
      }}
    />
  );
};

/** Animated particle field for intro/outro */
export const ParticleField: React.FC<{ count?: number }> = ({
  count = 30,
}) => {
  const frame = useCurrentFrame();

  const particles = Array.from({ length: count }, (_, i) => {
    const seed = i * 137.508; // Golden angle
    const x = ((seed * 7) % LAYOUT.width);
    const y = ((seed * 13) % LAYOUT.height);
    const size = 2 + (seed % 4);
    const speed = 0.3 + (seed % 0.7);
    const opacity = 0.1 + (seed % 0.3);

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: (y + frame * speed) % LAYOUT.height,
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: LAYOUT.colors.primaryLight,
          opacity: opacity * 0.5,
        }}
      />
    );
  });

  return <AbsoluteFill style={{ overflow: "hidden" }}>{particles}</AbsoluteFill>;
};

/** Step number badge */
export const StepBadge: React.FC<{
  stepIndex: number;
  totalSteps: number;
}> = ({ stepIndex, totalSteps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.overlayPadding,
        right: LAYOUT.overlayPadding,
        transform: `scale(${scale})`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${LAYOUT.colors.primary}, ${LAYOUT.colors.accent})`,
          borderRadius: 16,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            color: LAYOUT.colors.text,
            fontSize: 36,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
          }}
        >
          {stepIndex + 1}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 24,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
          }}
        >
          / {totalSteps}
        </span>
      </div>
    </div>
  );
};
