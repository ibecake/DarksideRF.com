import raw from "./catalogue.json";
import type { CatalogueFile, Satellite } from "../types";

export const catalogue = raw as CatalogueFile;

export const satellites: Satellite[] = catalogue.satellites;

export function satelliteById(id: string): Satellite | undefined {
  return satellites.find((satellite) => satellite.id === id);
}
