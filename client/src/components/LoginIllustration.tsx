import React from "react";

/**
 * Hand-authored line-art armchair: a flat side-profile silhouette (bold,
 * "front" strokes) plus three short offset "top plane" edges (seat,
 * backrest, armrest) connected back to the silhouette with dim connector
 * lines — the standard flat-icon-to-isometric extrusion trick, using a
 * single constant depth vector so the three planes stay parallel/consistent.
 *
 * Every stroke uses `pathLength={1}` so the stroke-dasharray/dashoffset
 * "draw-on" animation never needs a measured or estimated path length —
 * it's always exactly 0 to 1, staggered per group via --draw-delay.
 */
const DEPTH_DX = 34;
const DEPTH_DY = -20;

const offset = (x: number, y: number): [number, number] => [x + DEPTH_DX, y + DEPTH_DY];

// Front-facing top edges of the three "planes" that get an offset back edge.
const SEAT_EDGE: [[number, number], [number, number]] = [[40, 122], [122, 122]];
const BACKREST_EDGE: [[number, number], [number, number]] = [[54, 40], [74, 40]];
const ARMREST_EDGE: [[number, number], [number, number]] = [[84, 84], [114, 84]];

const DEPTH_EDGES = [SEAT_EDGE, BACKREST_EDGE, ARMREST_EDGE];

const draw = (delay: number, duration = 0.4): React.CSSProperties => ({
  ["--draw-delay" as string]: `${delay}s`,
  ["--draw-duration" as string]: `${duration}s`,
});

const LoginIllustration: React.FC = () => {
  return (
    <svg
      viewBox="0 0 180 180"
      width="200"
      height="200"
      className="login-illustration__svg"
      role="img"
      aria-label="Line illustration of an armchair"
    >
      <g className="login-illustration__back">
        {DEPTH_EDGES.map(([a, b], i) => {
          const [bx1, by1] = offset(a[0], a[1]);
          const [bx2, by2] = offset(b[0], b[1]);
          return (
            <line
              key={i}
              className="login-illustration__draw"
              style={draw(1.05 + i * 0.08, 0.35)}
              pathLength={1}
              x1={bx1}
              y1={by1}
              x2={bx2}
              y2={by2}
            />
          );
        })}
      </g>

      <g className="login-illustration__connector">
        {DEPTH_EDGES.flatMap(([a, b], i) => {
          const [ax2, ay2] = offset(a[0], a[1]);
          const [bx2, by2] = offset(b[0], b[1]);
          const delay = 1.05 + i * 0.08;
          return [
            <line
              key={`${i}-a`}
              className="login-illustration__draw"
              style={draw(delay, 0.35)}
              pathLength={1}
              x1={a[0]}
              y1={a[1]}
              x2={ax2}
              y2={ay2}
            />,
            <line
              key={`${i}-b`}
              className="login-illustration__draw"
              style={draw(delay, 0.35)}
              pathLength={1}
              x1={b[0]}
              y1={b[1]}
              x2={bx2}
              y2={by2}
            />,
          ];
        })}
      </g>

      <g className="login-illustration__front">
        <path
          className="login-illustration__draw"
          style={draw(0.45, 0.55)}
          pathLength={1}
          d="M40 122 L40 52 Q40 40 54 40 L74 40 Q84 40 84 50 L84 84"
        />
        <path
          className="login-illustration__draw"
          style={draw(0.75, 0.35)}
          pathLength={1}
          d="M84 84 L114 84 Q122 84 122 92 L122 122"
        />
        <path
          className="login-illustration__draw"
          style={draw(0.3, 0.3)}
          pathLength={1}
          d="M40 122 L122 122"
        />
        <path
          className="login-illustration__draw"
          style={draw(0, 0.35)}
          pathLength={1}
          d="M44 122 L38 154"
        />
        <path
          className="login-illustration__draw"
          style={draw(0.05, 0.35)}
          pathLength={1}
          d="M118 122 L124 154"
        />
        <path
          className="login-illustration__draw login-illustration__accent"
          style={draw(0.1, 0.35)}
          pathLength={1}
          d="M48 154 L50 122"
        />
      </g>
    </svg>
  );
};

export default LoginIllustration;
