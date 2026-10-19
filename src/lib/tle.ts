import type { OrbitMeanElements, Satellite } from "../types";

function checksum(body: string): number {
  let sum = 0;
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char >= "0" && char <= "9") sum += char.charCodeAt(0) - 48;
    else if (char === "-") sum += 1;
  }
  return sum % 10;
}

function field(value: string, width: number): string {
  return value.length >= width ? value.slice(0, width) : value.padStart(width, " ");
}

function exp8(value: number): string {
  if (!Number.isFinite(value) || value === 0) return " 00000+0";
  const sign = value < 0 ? "-" : " ";
  const magnitude = Math.abs(value);
  let exponent = Math.floor(Math.log10(magnitude)) + 1;
  let mantissa = Math.round(magnitude * 10 ** (5 - exponent));
  if (mantissa >= 100000) {
    mantissa = Math.round(mantissa / 10);
    exponent += 1;
  }
  if (mantissa <= 0) return " 00000+0";
  const exponentSign = exponent < 0 ? "-" : "+";
  return `${sign}${String(mantissa).padStart(5, "0")}${exponentSign}${Math.abs(exponent)}`;
}

function ndot10(value: number): string {
  const sign = value < 0 ? "-" : " ";
  const digits = Math.abs(value).toFixed(8);
  const body = digits.startsWith("0.") ? digits.slice(1) : digits;
  return (sign + body).slice(0, 10);
}

function epoch14(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
  if (!match) return "00000.00000000";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const seconds = Number(match[4]) * 3600 + Number(match[5]) * 60 + Number(match[6]);
  const dayNumber = (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86_400_000 + 1 + seconds / 86_400;
  return `${String(year % 100).padStart(2, "0")}${dayNumber.toFixed(8).padStart(12, "0")}`;
}

function designator(cospar: string): string {
  const match = cospar.match(/^(\d{4})-(\d{3})([A-Z]{1,3})$/i);
  if (!match) return "00000   ";
  return `${match[1].slice(2)}${match[2]}${match[3].toUpperCase().padEnd(3, " ")}`;
}

function catalog(norad: number): string {
  if (norad < 100000) return String(norad).padStart(5, "0");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const high = Math.floor(norad / 10000);
  return `${alphabet[high - 10] ?? "Z"}${String(norad % 10000).padStart(4, "0")}`;
}

export function tleLines(omm: OrbitMeanElements, name: string): [string, string, string] {
  const norad = catalog(omm.NORAD_CAT_ID);
  const line1 = [
    "1 ",
    norad,
    omm.CLASSIFICATION_TYPE || "U",
    " ",
    designator(omm.OBJECT_ID),
    " ",
    epoch14(omm.EPOCH),
    " ",
    ndot10(omm.MEAN_MOTION_DOT),
    " ",
    exp8(omm.MEAN_MOTION_DDOT),
    " ",
    exp8(omm.BSTAR),
    " ",
    String(omm.EPHEMERIS_TYPE ?? 0).slice(-1),
    " ",
    field(String(omm.ELEMENT_SET_NO % 10000), 4),
  ].join("");
  const line2 = [
    "2 ",
    norad,
    " ",
    field(omm.INCLINATION.toFixed(4), 8),
    " ",
    field(omm.RA_OF_ASC_NODE.toFixed(4), 8),
    " ",
    Math.round(omm.ECCENTRICITY * 10_000_000).toString().padStart(7, "0").slice(-7),
    " ",
    field(omm.ARG_OF_PERICENTER.toFixed(4), 8),
    " ",
    field(omm.MEAN_ANOMALY.toFixed(4), 8),
    " ",
    field(omm.MEAN_MOTION.toFixed(8), 11),
    String(Math.trunc(omm.REV_AT_EPOCH) % 100000).padStart(5, "0"),
  ].join("");
  const titled = name.trim().slice(0, 24);
  return [titled, `${line1}${checksum(line1)}`, `${line2}${checksum(line2)}`];
}

export function tleFor(satellite: Satellite): string {
  return tleLines(satellite.omm, satellite.name).join("\n");
}

export function catalogueTle(satellites: Satellite[]): string {
  return satellites.map(tleFor).join("\n");
}
