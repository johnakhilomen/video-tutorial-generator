import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import { LAYOUT } from "../utils/layout.js";
import { GradientOrb, ParticleField } from "../components/MotionGraphics.js";

interface OutroSceneProps {
  title: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter animation
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const titleY = interpolate(enterSpring, [0, 1], [50, 0]);

  // Checkmark animation
  const checkScale = spring({
    frame: frame - 8,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Subtitle animation
  const subtitleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: LAYOUT.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background */}
      <ParticleField count={30} />
      <GradientOrb x={LAYOUT.width * 0.5} y={LAYOUT.height * 0.5} size={900} color={LAYOUT.colors.primary} />
      <GradientOrb x={LAYOUT.width * 0.6} y={LAYOUT.height * 0.3} size={500} color={LAYOUT.colors.accent} delay={10} />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          zIndex: 10,
        }}
      >
        {/* Checkmark */}
        <div
          style={{
            transform: `scale(${checkScale})`,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${LAYOUT.colors.primary}, ${LAYOUT.colors.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13L9 17L19 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: enterSpring,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <h2
            style={{
              color: LAYOUT.colors.text,
              fontSize: LAYOUT.outroTitleSize,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 700,
              textAlign: "center",
              margin: 0,
            }}
          >
            Tutorial Complete
          </h2>
        </div>

        {/* Subtitle */}
        <div style={{ opacity: subtitleSpring }}>
          <p
            style={{
              color: LAYOUT.colors.textSecondary,
              fontSize: LAYOUT.outroSubtitleSize,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              textAlign: "center",
              margin: 0,
            }}
          >
            {title}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
