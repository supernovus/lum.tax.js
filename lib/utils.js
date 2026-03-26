const abs = Math.abs;
const cp = Object.assign;
const dp = Object.defineProperties;

const RSY = Symbol('@lumjs/tax~RoundFun');

// TODO: write tests for the individual functions in here.

/**
 * Get an optional callback function. 
 * @param {mixed} v - Value that might be a callback.
 * 
 * If this value is **NOT** a function, then a fallback callback that
 * always returns a fixed value and does nothing else will be returned.
 * 
 * @param {mixed} [d] Fixed value the fallback callback will return.
 * @returns {function}
 */
export const getCallback = (v,d) => ((typeof v === 'function') ? v : () => d);

/**
 * Is a value a closure function returned by {@link getRound} ?
 * @param {mixed} v
 * @returns {boolean}
 */
export const isRound = v => (typeof v === 'function' && v[RSY]);

/**
 * Get a percentage value as a decimal fraction.
 * @param {number} pv - The percentage value.
 * @param {object} [opts] Options.
 * @param {boolean} [opts.decimal=false] Percentage is a decimal fraction?
 * 
 * If this is false (the default), then `pv` represents a regular
 * percentage value between `0` and `100` (e.g. `7.5`), and will be
 * divided by 100 to convert it into a decimal fraction.
 * 
 * If this is set to true, then `pv` represents the percentage value is
 * already a decimal fraction between `0` and `1` (e.g. `0.075`), and will
 * be returned as-is.
 * 
 * @returns {number}
 */
export const getPercent = (pv, opts = {}) => opts.decimal ? pv : (pv / 100);

/**
 * Get a list of percentage values.
 * @param {number[]} pvs - Percentage values.
 * @param {object} [opts] Options.
 * @param {boolean} [opts.decimal=false] Percentages are decimal fractions?
 * 
 * This is handled in exactly the same way as the same-named option in the
 * {@link getPercent} function.
 * 
 * @returns {number[]}
 */
export const getPercents = (pvs, opts = {}) => 
  opts.decimal ? pvs : pvs.map(pv => pv / 100);

/**
 * Get a percentage of a value.
 * @param {number} val - The value the percentage is of.
 * @param {number} pct - The percentage value.
 * @param {(object|function)} [opts] Options.
 * 
 * See {@link getRound} for info on rounding options.
 * No default rounding options are used, so if you don't explicitly
 * specify any, no rounding will be performed.
 * 
 * See {@link getPercent} for info on percentage value options.
 * This will directly affect how the `pct` value is handled.
 * 
 * @returns {number}
 * 
 * @example
 * 
 * percentageOf(255, 25)        // → 63.75
 * percentageOf(255, 25, true)  // → 64
 * 
 */
export function percentageOf(val, pct, opts) {
  let round = getRound(opts);
  pct = getPercent(pct, round.nestOpts);
  return round(val * pct);
}

/**
 * Round a number to an integer using a specific rounding mode.
 * @param {number} val - Value to be rounded.
 * @param {number} [mode=0] Rounding mode:
 * 
 * - `0` (default) uses `Math.round()`.
 * - `1` (or any positive number) uses `Math.ceil()`.
 * - `-1` (or any negative number) uses `Math.floor()`.
 * 
 * @returns {number} May be `NaN` if either argument is invalid.
 */
export const round = (val, mode = 0) => mode
  ? (mode > 0 ? Math.ceil(val) : Math.floor(val))
  : Math.round(val);

/**
 * Round a number to a specific decimal precision base offset.
 * @param {number} val - Value to be rounded.
 * @param {number} [base=100] Decimal precision base offset.
 * @param {number} [mode=0] Rounding mode; see round() for details.
 * @returns {number} May be `NaN` if either argument is invalid.
 * @example
 * 
 * roundp(143.2763224) // → 143.28
 * roundp(143.598, 10) // → 143.6
 */
export const roundp = (val, base = 100, mode = 0) =>
  round(val * base, mode) / base;

/**
 * Round a number to a specific whole number base offset.
 * @param {number} val - Value to be rounded.
 * @param {number} [base=10] Whole number base offset.
 * @param {number} [mode=0] Rounding mode; see round() for details.
 * @returns {number} May be `NaN` if either argument is invalid.
 * @example
 * 
 * roundw(4143, 100) // → 4100
 * roundw(4143.8945) // → 4140
 * roundw(69,   100) // → 100
 * roundw(42,   100) // → 0
 * roundw(42)        // → 40
 * roundw(142)       // → 140
 * roundw(042)       // → 30 (octal 042 = 34 in decimal)
 */
export const roundw = (val, base = 10, mode = 0) =>
  round(val / base, mode) * base;

/**
 * Round a number to a base offset via a few different methods.
 * @param {number} val - Value to be rounded.
 * @param {number} [base=0] Offset base value.
 * 
 * - If this is `0` (default if omitted) returns `val` as-is.
 * - If this is `1` or `-1`, returns `round(val, mode)`.
 * - If this is a positive number, returns `roundp(val, base, mode)`.
 * - If this is a negative number, returns `roundw(val, abs(base), mode)`.
 * 
 * @param {number} [mode=0] Rounding mode; see round() for details.
 * @returns {number} May be `NaN` if either argument was invalid.
 * 
 * @example
 * 
 * round2(143.27632, 100)  // → 143.28
 * round2(4143.894, -100)  // → 4100
 */
export function round2(val, base = 0, mode = 0) {
  if (!base) return val; // no rounding
  if (base === 1 || base === -1) return round(val, mode);
  return base > 0 ? roundp(val, base, mode) : roundw(val, abs(base), mode);
}

/**
 * Round a value to a specific number of decimal places.
 * @param {number} val - Value to be rounded.
 * @param {number} [prec=0] Number of decimal places to keep.
 * @param {number} [mode=0] Rounding mode; see round() for details.
 * 
 * If this is `0` (default if omitted) then round() will be used directly.
 * 
 * If this value is anything other than `0`, it will be used to generate 
 * a base offset value which is then passed along to the round2() function.
 * 
 * If this is a negative number, then the offset generated will be negative.
 * So for example, the value `2` represents a base offset of `100`, 
 * while a value of `-2` represents a base offset of `-100`.
 * 
 * @returns {number} May be `NaN` if either argument was invalid.
 */
export function pround(val, prec = 0, mode = 0) {
  if (!prec) return round(val, mode);
  let base = (prec > 0) ? (10 ** prec) : ((10 ** abs(prec)) * -1);
  return round2(val, base);
}

/**
 * Get a function for rounding depending on options.
 * @param {(object|function)} [opts] Options.
 * 
 * If this is a function, it **MUST** be the return value from a previous
 * call to getRound(); such functions are closures tagged with an internal
 * Symbol and providing some additional metadata. Any other functions will
 * be treated as an empty object, which is likely not what you want!
 * 
 * @param {(object|boolean|function)} [opts.round] Rounding options.
 * 
 * If this is `true` then it's the same as: `{base: 100}`;
 * if it is `false` it's the same as omitting it.
 * 
 * If this is a function, it is handled exactly the same as when `opts`
 * is a function; see the opts description for details.
 * 
 * @param {number} [opts.round.base] Base offset for round2() function.
 * 
 * This option is ignored if opts.round.prec is specified.
 * 
 * @param {number} [opts.round.prec] Precision for pround() function.
 * 
 * If this is specified then pround() will be used instead of round2().
 * 
 * @param {number} [opts.round.mode] Rounding mode. 
 * 
 * Used by both pround() and round2(); see round() function for details.
 * If this is omitted, the default mode (`0`) will be used.
 * 
 * @returns {RoundFun}
 * 
 * If opts.round was omitted or false, a passthrough function will simply
 * return any value passed to it unchanged. Otherwise the returned function 
 * will be a wrapper around either pround() or round2() depending on which
 * options were specified.
 */
export function getRound(opts) {
  if (isRound(opts)) { return opts }
  if (isRound(opts?.round)) { return opts.round }

  let round;

  if (opts?.round) {
    let ro = cp({ base: 100 }, opts.round);
    round = (typeof ro.prec === 'number')
      ? (v) => pround(v, ro.prec, ro.mode)
      : (v) => round2(v, ro.base, ro.mode)
    dp(round, {
      passthru: { value: false },
      roundOpts: { value: ro },
    });
  }
  else { // Passthrough function
    round = v => v;
    dp(round, {
      passthru: { value: true },
      roundOpts: { value: null },
    });
  }

  dp(round, {
    [RSY]: { value: true },
    initOpts: { value: opts },
    nestOpts: { value: cp({}, opts, { round }) },
  });

  return round;
}

/**
 * @typedef {object} RoundFunProps
 * 
 * @prop {?object} initOpts - Original options passed to getRound().
 * @prop {?object} roundOpts - Rounding options.
 * 
 * If `initOpts.round` was an object, this will be a _copy_ of that
 * object, along with any defaults composed into it.
 * 
 * If `initOpts.round` was omitted or false, this will be null.
 * 
 * @prop {object} nestOpts - Options designed for nested calls.
 * 
 * This will be a _copy_ of `initOpts`, but will have the `round`
 * property set to _this_ RoundFun function. Any calls to getRound()
 * using the nestOpts will return this cached round function.
 * 
 * @prop {boolean} passthru - If this is true, then the RoundFun
 * will return any values passed to it as-is rather than performing
 * any kind of rounding.
 * 
 * This will only be true if `initOpts.round` evaluates as false
 * in a boolean context (which includes if it was omitted entirely).
 */

/**
 * @callback RoundFunCall
 * @param {number} value - Value to be rounded.
 * @returns {number}
 */

/**
 * A closure function for rounding numbers.
 * 
 * Which function it uses behind the scenes depends on the options
 * that were passed to getRound(); in some cases the function will
 * simply return the value unchanged.
 * 
 * @typedef {RoundFunCall & RoundFunProps} RoundFun
 */
