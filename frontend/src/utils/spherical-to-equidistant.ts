export function sphericalToEquiretangular(lat: number, lon: number) {
  const x = lon * 4 + 720;
  const y = (90 - lat) * (720 / 180);

  return [x, y];
}
