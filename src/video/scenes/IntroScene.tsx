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

interface IntroSceneProps {
  title: string;
  description: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  title,
  description,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title animation
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = titleSpring;

  // Subtitle animation (delayed)
  const subtitleSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const subtitleY = interpolate(subtitleSpring, [0, 1], [40, 0]);
  const subtitleOpacity = subtitleSpring;

  // Decorative line animation
  const lineWidth = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  // Exit fade
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: LAYOUT.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Animated background elements */}
      <ParticleField count={40} />
      <GradientOrb x={LAYOUT.width * 0.3} y={LAYOUT.height * 0.4} size={800} color={LAYOUT.colors.primary} />
      <GradientOrb x={LAYOUT.width * 0.7} y={LAYOUT.height * 0.6} size={600} color={LAYOUT.colors.accent} delay={15} />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          zIndex: 10,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <h1
            style={{
              color: LAYOUT.colors.text,
              fontSize: LAYOUT.introTitleSize,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.1,
              maxWidth: LAYOUT.width * 0.7,
            }}
          >
            {title}
          </h1>
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: interpolate(lineWidth, [0, 1], [0, 200]),
            height: 4,
            background: `linear-gradient(90deg, ${LAYOUT.colors.primary}, ${LAYOUT.colors.accent})`,
            borderRadius: 2,
          }}
        />

        {/* Description */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          <p
            style={{
              color: LAYOUT.colors.textSecondary,
              fontSize: LAYOUT.introSubtitleSize,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              textAlign: "center",
              margin: 0,
              maxWidth: LAYOUT.width * 0.6,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
