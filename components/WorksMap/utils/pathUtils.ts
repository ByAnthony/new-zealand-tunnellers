export function groupPathsBySegment<
  T extends { segment: number; latitude: number; longitude: number },
>(
  rawPaths: T[],
  getId: (p: T) => number,
): Map<string, { id: number; points: [number, number][] }> {
  const map = new Map<string, { id: number; points: [number, number][] }>();
  rawPaths.forEach((p) => {
    const id = getId(p);
    const key = `${id}-${p.segment}`;
    if (!map.has(key)) map.set(key, { id, points: [] });
    map.get(key)!.points.push([Number(p.latitude), Number(p.longitude)]);
  });
  return map;
}
