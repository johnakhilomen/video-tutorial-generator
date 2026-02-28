export interface TutorialPlan {
  title: string;
  description: string;
  targetUrl: string;
  steps: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  title: string;
  narrationText: string;
  browserInstructions: string;
  expectedDurationSeconds: number;
  zoomTarget: ZoomTarget | null;
}

export interface ZoomTarget {
  description: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scale?: number;
}
