import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { LAYOUT } from "../utils/layout.js";

interface TextOverlayProps {
  text: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  appearFrame?: number;
  disappearFrame?: number;
  fontSize?: number;
}

const positionStyles: Record<string, React.CSSProperties> = {
  "top-left": {
    top: LAYOUT.overlayPadding,
    left: LAYOUT.overlayPadding,
  },
  "top-right": {
    top: LAYOUT.overlayPadding,
    right: LAYOUT.overlayPadding,
  },
  "bottom-left": {
    bottom: LAYOUT.overlayPadding + LAYOUT.progressBarHeight + 20,
    left: LAYOUT.overlayPadding,
  },
  "bottom-right": {
    bottom: LAYOUT.overlayPadding + LAYOUT.progressBarHeight + 20,
    right: LAYOUT.overlayPadding,
  },
  center: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
};

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  position = "bottom-left",
  appearFrame = 0,
  disappearFrame,
  fontSize = LAYOUT.stepTitleSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInDuration = Math.round(fps * 0.5); // 0.5s fade in
  const fadeOutDuration = Math.round(fps * 0.3); // 0.3s fade out

  // Fade in
  const fadeIn = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: fadeInDuration,
  });

  // Fade out
  const fadeOut = disappearFrame
    ? interpolate(
        frame,
        [disappearFrame - fadeOutDuration, disappearFrame],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  const opacity = fadeIn * fadeOut;

  // Slide up entrance
  const slideY = interpolate(fadeIn, [0, 1], [20, 0]);

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles[position],
        opacity,
        transform:
          position === "center"
            ? `translate(-50%, calc(-50% + ${slideY}px))`
            : `translateY(${slideY}px)`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          backgroundColor: LAYOUT.colors.overlayBg,
          borderRadius: 16,
          padding: "16px 32px",
          backdropFilter: "blur(20px)",
          border: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <span
          style={{
            color: LAYOUT.colors.text,
            fontSize,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
