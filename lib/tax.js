import { getPercents, getRound } from "./utils.js";

const cp = Object.assign;
const DEF_OPTS = {round: true}

/**
 * Given a subtotal and list of tax rates, calculate the values
 * of the individual taxes, and the grand total after taxes.
 * 
 * @param {number} subtotal - The total before taxes.
 * @param {number[]} taxRates - A flat array of tax rates.
 * @param {(object|function)} [opts] Options.
 * 
 * If this is omitted the default is `{round: true}`;
 * See {@link getRound} for more details.
 * 
 * See {@link getPercents} for info on percentage value options,
 * which will affect how the `taxRates` are handled.
 * 
 * @return {CalculateTaxesInfo}
 */
export function calculateTaxes(subtotal, taxRates, opts = DEF_OPTS) {
  if (!Array.isArray(taxRates)) {
    throw new TypeError('taxRates must be an array');
  }

  let round = getRound(opts);
  subtotal = round(subtotal);
  taxRates = getPercents(taxRates, round.nestOpts);

  let taxes = [];
  let taxsum = 0;

  for (let rate of taxRates) {
    let tax = round(rate * subtotal);
    taxes.push(tax);
    taxsum += tax;
  }

  taxes.unshift(round(taxsum));

  let total = subtotal + taxsum;
  taxes.unshift(round(total));

  return taxes;
}

/**
 * Given a grand total and a list of tax rates, figure out the subtotal,
 * and the values of the individual taxes.
 *
 * @param {number} total - The total after taxes.
 * @param {number[]} taxRates - A flat array of tax rates.
 * @param {(object|function)} [opts] Options.
 * 
 * If this is omitted the default is `{round: true}`;
 * See {@link getRound} for more details.
 * 
 * See {@link getPercents} for info on percentage value options,
 * which will affect how the `taxRates` are handled.
 * 
 * @return {ExtractTaxesInfo}
 */
export function extractTaxes(total, taxRates, opts = DEF_OPTS) {
  if (!Array.isArray(taxRates)) {
    throw new TypeError('taxRates must be an array');
  }

  let taxes = [];
  let tax = 0;
  let round = getRound(opts);
  total = round(total);
  taxRates = getPercents(taxRates, round.nestOpts);
  
  for (let rate of taxRates) {
    tax += rate;
  }
  tax += 1;

  let subtotal = round(total / tax);
  taxes.push(subtotal);
  let taxsum = round(total - subtotal);
  taxes.push(taxsum);

  for (let rate of taxRates) {
    tax = rate * subtotal;
    if (round)
      tax = round(tax);
    taxes.push(tax);
  }

  return taxes;
}

/**
 * A class to make calculating tax values "easy".
 * 
 * This class basically just allows you to set the tax rates and default
 * options once, and then make multiple method calls with simplified APIs.
 */
export class Tax {
  /**
   * Construct a Tax object.
   * @param {number[]} taxRates - An array of tax rates (e.g. `[5, 7]`).
   * @param {(object|function)} [opts] Default options.
   *
   * The options specified here will be used as the defaults for the
   * calculateTaxes() and extractTaxes() methods.
   * 
   * The `taxRates` will be passed through getPercents() during the
   * construction of this instance, and then the copy of the options
   * saved for use in method calls will have `opts.decimal` set to true
   * regardless of what it was set to originally.
   */
  constructor(taxRates, opts = DEF_OPTS) {
    this.opts = getRound(opts).nestOpts;
    this.taxRates = getPercents(taxRates, this.opts);
    this.opts.decimal = true; // Gonna be true now.
  }

  /**
   * Calculate the tax values from a sub-total.
   * @param {number} subtotal - The total before taxes.
   * @param {object} [opts] Options; see {@link calculateTaxes}.
   * 
   * The options passed here will be composed with `this.opts` as defaults.
   * 
   * You should never have to specify the `opts.decimal` option,
   * as `this.taxRates` is already converted to decimal format,
   * and `this.opts.decimal` is set to true during construction.
   * 
   * @return {CalculateTaxesInfo}
   */
  calculateTaxes(subtotal, opts) {
    return calculateTaxes(subtotal, this.taxRates, cp({}, this.opts, opts));
  }

  /**
   * Given a total and a list of tax rates, figure out what the
   * subtotal, and the individual taxes on the item where.
   * @param {number} total - The total after taxes.
   * @param {object} [opts] Options; see {@link extractTaxes}.
   * 
   * The options passed here will be composed with `this.opts` as defaults.
   * 
   * You should never have to specify the `opts.decimal` option,
   * as `this.taxRates` is already converted to decimal format,
   * and `this.opts.decimal` is set to true during construction.
   * 
   * @return {ExtractTaxesInfo}
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


/**
 * @typedef {number[]} CalculateTaxesInfo
 * - The first number will be the total after taxes.
 * - The second number will be the total tax amount.
 * - The rest will be the taxes for each tax rate specified.
 */

/**
 * @typedef {number[]} ExtractTaxesInfo
 * - The first element will be the subtotal before taxes.
 * - The second element will be the total tax amount.
 * - The rest will be the taxes for each tax rate specified.
 */
