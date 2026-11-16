export function clampTime(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function templeLighting(value: number) {
  const time = clampTime(value);
  const night = Math.max(0, (time - 65) / 35);
  const dawn = Math.max(0, 1 - time / 22);
  const sunset = Math.max(0, 1 - Math.abs(time - 65) / 22);
  return { night, dawn, sunset, brightness: 1 - night * 0.65 - sunset * 0.15 };
}