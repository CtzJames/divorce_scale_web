const MAX_SCORE = 5;
const CHART_SIZE = 360;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 112;
const LABEL_RADIUS = 145;
const GRID_LEVELS = [0.2, 0.4, 0.6, 0.8, 1];

function getPointByRatio(angle, ratio) {
  const radius = MAX_RADIUS * ratio;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function getLabelPoint(angle) {
  return {
    x: CENTER + Math.cos(angle) * LABEL_RADIUS,
    y: CENTER + Math.sin(angle) * LABEL_RADIUS,
  };
}

function getPolygonPoints(angles, ratio) {
  return angles
    .map((angle) => {
      const point = getPointByRatio(angle, ratio);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

export default function AdminDimensionRadarChart({ dimensions = [] }) {
  const safeDimensions = dimensions.filter((item) => Number.isFinite(item.avg));

  if (safeDimensions.length < 3) {
    return <p className="radar-empty">维度数据不足，暂不绘制雷达图。</p>;
  }

  const step = (Math.PI * 2) / safeDimensions.length;
  const angles = safeDimensions.map((_, index) => -Math.PI / 2 + step * index);

  const dataPoints = safeDimensions.map((item, index) => {
    const normalized = Math.max(0, Math.min(MAX_SCORE, item.avg)) / MAX_SCORE;
    return getPointByRatio(angles[index], normalized);
  });

  const dataAreaPoints = dataPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const baselinePoints = angles
    .map((angle) => getPointByRatio(angle, 0.72))
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="radar-chart-wrap">
      <div className="radar-canvas" role="img" aria-label="用户测评详细解读报告维度雷达图">
        <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          <defs>
            <linearGradient id="reportRadarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2A4FD7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0E3D74" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {GRID_LEVELS.map((level) => (
            <polygon
              key={level}
              points={getPolygonPoints(angles, level)}
              fill="none"
              stroke={level === 1 ? "#C6D3E5" : "#DEE7F1"}
              strokeWidth="1"
            />
          ))}

          {angles.map((angle) => {
            const end = getPointByRatio(angle, 1);
            return (
              <line
                key={angle}
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="#DEE7F1"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={baselinePoints}
            fill="none"
            stroke="#7A8FAE"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />

          <polygon
            points={dataAreaPoints}
            fill="url(#reportRadarFill)"
            stroke="#214CA1"
            strokeWidth="2.4"
          />

          {dataPoints.map((point) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r="4.5"
              fill="#214CA1"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ))}

          {safeDimensions.map((item, index) => {
            const labelPoint = getLabelPoint(angles[index]);
            return (
              <text
                key={`${item.code}-label`}
                className="radar-label"
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {item.shortName || item.code}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="radar-legend-inline">
        <span>
          <i className="radar-legend-line solid" />
          您的得分
        </span>
        <span>
          <i className="radar-legend-line dashed" />
          该维度平均水平
        </span>
      </div>
    </div>
  );
}
