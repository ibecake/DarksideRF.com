function compass(azimuth: number): string {
  const names = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return names[Math.round(azimuth / 22.5) % 16];
}

function place(azimuth: number, elevation: number, cx: number, cy: number, radius: number): [number, number] {
  const reach = ((90 - Math.max(0, Math.min(90, elevation))) / 90) * radius;
  const radians = (azimuth * Math.PI) / 180;
  return [cx + reach * Math.sin(radians), cy - reach * Math.cos(radians)];
}

export function PassSky({
  aosAzimuth,
  maxAzimuth,
  losAzimuth,
  maxElevation,
  minElevation,
}: {
  aosAzimuth: number;
  maxAzimuth: number;
  losAzimuth: number;
  maxElevation: number;
  minElevation: number;
}) {
  const size = 168;
  const center = size / 2;
  const radius = 68;
  const rings = [30, 60].map((elevation) => ((90 - elevation) / 90) * radius);
  const start = place(aosAzimuth, minElevation, center, center, radius);
  const peak = place(maxAzimuth, maxElevation, center, center, radius);
  const end = place(losAzimuth, minElevation, center, center, radius);

  return (
    <figure className="sky">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Rises ${compass(aosAzimuth)}, peaks at ${Math.round(maxElevation)} degrees toward ${compass(maxAzimuth)}, sets ${compass(losAzimuth)}`}>
        <circle className="ring" cx={center} cy={center} r={radius} />
        {rings.map((ring) => <circle key={ring} className="ring" cx={center} cy={center} r={ring} />)}
        <path className="ring" d={`M ${center} ${center - radius} L ${center} ${center + radius} M ${center - radius} ${center} L ${center + radius} ${center}`} />
        <text x={center} y="14">N</text>
        <text x={size - 12} y={center + 4}>E</text>
        <text x={center} y={size - 4}>S</text>
        <text x="6" y={center + 4}>W</text>
        <polyline points={`${start[0]},${start[1]} ${peak[0]},${peak[1]} ${end[0]},${end[1]}`} />
        <circle className="mark" cx={start[0]} cy={start[1]} r="3.2" />
        <circle className="mark" cx={peak[0]} cy={peak[1]} r="4" />
        <circle className="mark" cx={end[0]} cy={end[1]} r="3.2" />
      </svg>
      <figcaption>
        Rises {compass(aosAzimuth)} · peak {Math.round(maxElevation)}° toward {compass(maxAzimuth)} · sets {compass(losAzimuth)}
      </figcaption>
    </figure>
  );
}
