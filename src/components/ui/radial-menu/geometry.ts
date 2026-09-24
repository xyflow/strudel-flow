export function point(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 240 + radius * Math.cos(radians),
    y: 240 - radius * Math.sin(radians),
  };
}

// Rounded ring segments with consistent spacing along their shared edges.
export function sector(index: number, count = 4, outer = 130, inner = 46) {
  const slice = 180 / count;
  const start = 180 - index * slice;
  const end = start - slice;
  const halfGap = 4.5;
  const inset = (radius: number) =>
    (Math.asin(halfGap / radius) * 180) / Math.PI;
  const outerStart = start - inset(outer);
  const outerEnd = end + inset(outer);
  const innerStart = start - inset(inner);
  const innerEnd = end + inset(inner);
  // Keep rounded corners from crossing on the narrower inner edge.
  const corner = (radius: number) =>
    Math.min(
      20,
      (((slice - 2 * inset(radius)) * Math.PI) / 180) * radius * 0.4,
    );
  const outerCorner = corner(outer);
  const innerCorner = corner(inner);
  const outerInset = ((outerCorner / outer) * 180) / Math.PI;
  const innerInset = ((innerCorner / inner) * 180) / Math.PI;
  const at = (radius: number, angle: number) => {
    const { x, y } = point(radius, angle);
    return `${x} ${y}`;
  };
  return `M ${at(outer - outerCorner, start - inset(outer - outerCorner))}
    Q ${at(outer, outerStart)} ${at(outer, outerStart - outerInset)}
    A ${outer} ${outer} 0 0 1 ${at(outer, outerEnd + outerInset)}
    Q ${at(outer, outerEnd)} ${at(outer - outerCorner, end + inset(outer - outerCorner))}
    L ${at(inner + innerCorner, end + inset(inner + innerCorner))}
    Q ${at(inner, innerEnd)} ${at(inner, innerEnd + innerInset)}
    A ${inner} ${inner} 0 0 0 ${at(inner, innerStart - innerInset)}
    Q ${at(inner, innerStart)} ${at(inner + innerCorner, start - inset(inner + innerCorner))} Z`;
}
