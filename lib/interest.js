import { getRound } from "./utils.js";

const DEF_OPTS = {round: true}

/**
 * Get a percentage of a value.
 * @param {number} val - The value the percentage is of.
 * @param {number} pct - The percentage value.
 * 
 * 7.5% must be specified as `7.5` rather than `0.075`
 * 
 * @param {object} [opts] Options.
 * 
 * See {@link getRound} for more details.
 * 
 * This function does not have a default value for this,
 * so unless you specify something here, no rounding will be done.
 * 
 * @returns {number}
 * 
 * @example
 * 
 * percentage(255, 25)        // → 63.75
 * percentage(255, 25, true)  // → 64
 * 
 */
export function percentage(val, pct, opts) {
  let round = getRound(opts);
  return round(val * (pct / 100));
}

/**
 * Calculate fixed-rate compound interest.
 * @param {number} value - The initial value to apply interest to.
 * @param {number} rate - The interest rate as a percentage value.
 * @param {number} [times=1] Number of times to apply interest.
 * 
 * It doesn't make sense to omit this as the default of `1` will
 * only ever apply the interest once, in which case there's nothing
 * to *compound* at all and you might as well have just used the
 * percentage function itself.
 * 
 * @param {object} [opts] Options.
 * 
 * If this is omitted the default is `{round: true}`;
 * See {@link getRound} for more details.
 * 
 * @returns {CompoundInterestInfo}
 */
export function compoundInterest(value, rate, times=1, opts = DEF_OPTS) {
  let round = getRound(opts);
  let totalInterest = 0;
  let intList = [];
  let values = [value];
  for (let t = 0; t < times; t++) {
    let interest = percentage(value, rate, round);
    intList.push(interest);
    value += interest;
    values.push(value);
    totalInterest += interest;
  }
  return {value, values, interest: intList, totalInterest}
}

// TODO: finish documenting this
// TODO: write tests for all of these functions and classes

export class BaseInterestTerm {
  constructor(name, rate, opts = {}) {
    this.name = name;
    this.rate = rate;
    this.opts = opts;
  }

  get(value, times=1) {
    let info = compoundInterest(value, this.rate, times, this.opts);
    info.name = this.name;
    return info;
  }
}

export class NestedInterestTerm {
  constructor(name, nextTerm, nextCount, opts = {}) {
    this.name = name;
    this.nextTerm = nextTerm;
    this.nextCount = nextCount;
    this.opts = opts;
  }

  get(value, times=1) {
    let termList = [];
    let totalInterest = 0;
    for (let t = 0; t < times; t++) {
      let nextInfo = this.nextTerm.get(value, this.nextCount);
      termList.push(nextInfo);
      value = nextInfo.value;
      totalInterest += nextInfo.totalInterest;
    }
    return {name: this.name, value, totalInterest, term: termList}
  }
}

export class InterestBuilder {
  constructor(opts = DEF_OPTS) {
    this.opts = getRound(opts).nestOpts;
    this.current = null;
  }

  term(name, value) {
    if (!this.current) {
      this.current = new BaseInterestTerm(name, value, this.opts);
    }
    else {
      let cur = this.current;
      this.current = new NestedInterestTerm(name, cur, value, this.opts);
    }
  }

  done() {
    return this.current;
  }
}

export const buildInterest = (opts) => new InterestBuilder(opts);

/**
 * @typedef {object} IProps
 * @prop {number} totalInterest - The total amount of interest applied.
 * @prop {number} value - The value after applying all interest charges.
 */

/**
 * @typedef {object} CIProps
 * @prop {number[]} interest - List of interest amounts applied.
 * @prop {number[]} values - List of all incremental values.
 * 
 * The list starts with the initial value that was passed,
 * and then will have one value for every time interest was applied.
 */

/**
 * Compound Interest Info
 * @typedef {IProps & CIProps} CompoundInterestInfo
 */

/**
 * @typedef {object} ITProps
 * @prop {string} name - Name of the term unit.
 */

/**
 * Interest Info for Base Term
 * @typedef {ITProps & CompoundInterestInfo} BaseInterestInfo
 */

/**
 * @typedef {object} NIProps
 * @prop {(BaseInterestInfo | NestedInterestInfo)} term - Info for next term.
 */

/**
 * Interest Info for Nested Term
 * @typedef {ITProps & IProps & NIProps} NestedInterestInfo
 */
