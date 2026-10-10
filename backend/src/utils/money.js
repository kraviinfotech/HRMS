import Decimal from "decimal.js";

export function toMoney(value) {
  return new Decimal(value || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

export function sumMoney(values) {
  return toMoney(values.reduce((total, value) => new Decimal(total).plus(value || 0).toNumber(), 0));
}
