import Tests from '@lumjs/tests';
import { Tax } from '../lib/tax.js';

const plan = 4;
const t = Tests.new({module: import.meta, plan});

const TR = [5, 7];
const wantC = [112, 12, 5, 7];
const wantE = [100, 12, 5, 7];

let res = Tax.calculateTaxes(100, TR);
t.isJSON(res, wantC, 'calculateTaxes static call');

res = Tax.extractTaxes(112, TR);
t.isJSON(res, wantE, 'extractTaxes static call');

let tax = new Tax(TR);

res = tax.calculateTaxes(100);
t.isJSON(res, wantC, 'calculateTaxes instance call');

res = tax.extractTaxes(112);
t.isJSON(res, wantE, 'extractTaxes instance call');

// TODO: add more tests for the uncommon options.

t.done();

export default t;
