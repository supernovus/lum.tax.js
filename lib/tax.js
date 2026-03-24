import { getRound } from "./utils.js";

const cp = Object.assign;
const DEF_OPTS = {round: true}

/**
 * Return an array with tax values.
 *
 * @param {number} subtotal - The total before taxes.
 * @param {number[]} taxRates - A flat array of tax rates.
 * @param {object} [opts] Options.
 * 
 * If this is omitted the default is `{round: true}`;
 * See {@link getRound} for more details.
 * 
 * @return {number[]} An array of tax values.
 *
 * - The first number will be the total after taxes.
 * - The second number will be the total tax amount.
 * - The rest will be the taxes for each tax rate specified.
 * 
 */
export function calculateTaxes(subtotal, taxRates, opts = DEF_OPTS) {
  if (!Array.isArray(taxRates)) {
    throw new TypeError('taxRates must be an array');
  }

  let round = getRound(opts);
  subtotal = round(subtotal);

  let taxes = [];
  let taxsum = 0;

  for (let t in taxRates) {
    let tax = round(taxRates[t] * subtotal);
    taxes.push(tax);
    taxsum += tax;
  }

  taxes.unshift(round(taxsum));

  let total = subtotal + taxsum;
  taxes.unshift(round(total));

  return taxes;
}

/**
 * Given a total and a list of tax rates, figure out what the
 * subtotal, and the individual taxes on the item where.
 *
 * @param {number} total - The total after taxes.
 * @param {number[]} taxRates - A flat array of tax rates.
 * @param {object} [opts] Options.
 * 
 * If this is omitted the default is `{round: true}`;
 * See {@link getRound} for more details.
 * 
 * @return {number[]} An array of values.
 *
 * - The first element will be the subtotal before taxes.
 * - The second element will be the total tax amount.
 * - The rest will be the taxes for each tax rate specified.
 *
 */
export function extractTaxes(total, taxRates, opts = DEF_OPTS) {
  if (!Array.isArray(taxRates)) {
    throw new TypeError('taxRates must be an array');
  }

  let round = getRound(opts);
  total = round(total);

  var taxes = [];
  var tax = 0;
  var t;
  for (t in taxRates) {
    tax += taxRates[t];
  }
  tax += 1;

  var subtotal = round(total / tax);
  taxes.push(subtotal);
  var taxsum = round(total - subtotal);
  taxes.push(taxsum);

  for (t in taxRates) {
    tax = taxRates[t] * subtotal;
    if (round)
      tax = round(tax);
    taxes.push(tax);
  }
  return taxes;
}

/**
 * A class to make calculating tax values "easy".
 */
export class Tax {
  /**
   * Construct a Tax object.
   * @param {number[]} taxRates A flat array of tax rates, e.g. [0.05, 0.07]
   * @param {object} [opts] Options for calculateTaxes() and extractTaxes();
   *
   * If this is omitted the default is `{round: true}`;
   * See {@link getRound} for more details.
   * 
   */
  constructor(taxRates, opts = DEF_OPTS) {
    this.taxRates = taxRates;
    this.opts = opts;
  }

  /**
   * Calculate the tax values from a sub-total.
   * @param {number} subtotal - The total before taxes.
   * @param {object} [opts] Options here will override those in `this.opts`.
   * @return {number[]}  See {@link module:@lumjs/tax.calculateTaxes}
   */
  calculateTaxes(subtotal, opts) {
    return calculateTaxes(subtotal, this.taxRates, cp({}, this.opts, opts));
  }

  /**
   * Given a total and a list of tax rates, figure out what the
   * subtotal, and the individual taxes on the item where.
   * @param {number} total     The total after taxes.
   * @param {object} [opts] Options here will override those in `this.opts`.
   * @return {number[]}  See {@link module:@lumjs/tax.extractTaxes}
   */
  extractTaxes(total, opts) {
    return extractTaxes(total, this.taxRates, cp({}, this.opts, opts));
  }

} // class Tax

/**
 * Static alias to calculateTaxes function.
 */
Tax.calculateTaxes = calculateTaxes;

/**
 * Static alias to extractTaxes function.
 */
Tax.extractTaxes = extractTaxes;
