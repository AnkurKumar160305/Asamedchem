/**
 * Unit Conversion Utilities
 * 
 * Strategy: All quantities are stored in base units internally.
 * Weight → grams (g)
 * Volume → milliliters (mL)
 * Count  → units (count)
 * 
 * Conversions happen:
 * - Input:  User enters kg/L → convertToBaseUnit() → store in g/mL
 * - Output: Read from DB in g/mL → convertFromBaseUnit() → display in kg/L
 */

// Conversion factors TO base unit
const TO_BASE: Record<string, number> = {
  g: 1,
  kg: 1000,        // 1 kg = 1000 g
  mL: 1,
  L: 1000,         // 1 L = 1000 mL
  count: 1,
};

// What is the base unit for each unit type
const BASE_UNIT_MAP: Record<string, string> = {
  g: 'g',
  kg: 'g',
  mL: 'mL',
  L: 'mL',
  count: 'count',
};

// Compatible units grouped by dimension
const UNIT_GROUPS: Record<string, string[]> = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count: ['count'],
};

/**
 * Convert a quantity from any supported unit to its base unit.
 * e.g. convertToBaseUnit(2.5, 'kg') → 2500 (grams)
 */
export function convertToBaseUnit(quantity: number, unit: string): number {
  const factor = TO_BASE[unit];
  if (factor === undefined) throw new Error(`Unknown unit: ${unit}`);
  return quantity * factor;
}

/**
 * Convert a quantity from base unit to a display unit.
 * e.g. convertFromBaseUnit(2500, 'kg') → 2.5
 */
export function convertFromBaseUnit(baseQuantity: number, targetUnit: string): number {
  const factor = TO_BASE[targetUnit];
  if (factor === undefined) throw new Error(`Unknown unit: ${targetUnit}`);
  return baseQuantity / factor;
}

/**
 * Calculate total price given quantity in any unit and price per base unit.
 * e.g. calculatePrice(2, 'kg', 0.05) → 2 * 1000 * 0.05 = 100
 */
export function calculatePrice(quantity: number, unit: string, pricePerBaseUnit: number): number {
  const baseQty = convertToBaseUnit(quantity, unit);
  return baseQty * pricePerBaseUnit;
}

/**
 * Get the base unit for a given unit.
 * e.g. getBaseUnit('kg') → 'g'
 */
export function getBaseUnit(unit: string): string {
  return BASE_UNIT_MAP[unit] || unit;
}

/**
 * Get all compatible units for a given unit.
 * e.g. getCompatibleUnits('kg') → ['g', 'kg']
 */
export function getCompatibleUnits(unit: string): string[] {
  for (const group of Object.values(UNIT_GROUPS)) {
    if (group.includes(unit)) return group;
  }
  return [unit];
}

/**
 * Generate a human-readable SKU.
 */
export function generateSKU(category: string, name: string): string {
  const catPrefix = category.substring(0, 3).toUpperCase();
  const namePrefix = name.substring(0, 3).toUpperCase();
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${catPrefix}-${namePrefix}-${rand}`;
}
