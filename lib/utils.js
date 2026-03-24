const abs = Math.abs;
const cp = Object.assign;
const dp = Object.defineProperties;

const RSY = Symbol('@lumjs/tax~RoundFun');

export const isRound = v => (typeof v === 'function' && v[RSY]);

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
  let base = (prec > 0) ? 10 ** prec : (10 ** abs(prec)) * -1;
  return round2(val, base);
}

/**
 * Get a function for rounding depending on options.
 * @param {object} [opts] Options.
 * @param {(object|boolean)} [opts.round] Rounding options.
 * 
 * If this is `true` then it's the same as: `{base: 100}`;
 * if it is `false` it's the same as omitting it.
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
export const getRound = (opts) => {
  if (isRound(opts)) { return opts }
  if (isRound(opts?.round)) { return opts.round }

  let round;

  if (opts?.round) {
    let ro = cp({base: 100}, opts.round);
    round = (typeof ro.prec === 'number')
      ? (v) => pround(v, ro.prec, ro.mode)
      : (v) => round2(v, ro.base, ro.mode)
    dp(round, {
      roundOpts: { value: ro },
    });
  }
  else { // Passthrough function
    round = v => v;
  }

  dp(round, {
    [RSY]: { value: true },
    initOpts: { value: opts },
    nestOpts: { value: cp({}, opts, {round}) },
  });

  return round;
}

/**
 * A closure function for rounding numbers.
 * 
 * Which function it uses behind the scenes depends on the options
 * that were passed to getRound(); in some cases the function will
 * simply return the value unchanged.
 * 
 * @callback RoundFun
 * @param {number} val - Value to be rounded.
 * @returns {number}
 */
