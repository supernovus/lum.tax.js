import Tests from '@lumjs/tests';
import * as Int from '../lib/interest.js';

const plan = 13;
const t = Tests.new({ module: import.meta, plan });

let builder = Int.buildInterest();
t.isa(builder, Int.InterestBuilder, 'buildInterest() returned builder');

let it = builder
  .term('month', 2.5)
  .term('year')
  .done();

t.isa(it, Int.NestingInterestTerm, 'builder made a nesting term instance');
t.isa(it.nested, Int.BaseInterestTerm, 'with a nested base term instance');

let want = {
  value: 1402.55,
  totalInterest: 402.55,
}
let res = Int.compoundInterest(1000, 7, 5);

t.is(res.value, want.value, 'compoundInterest() value');
t.is(res.totalInterest, want.totalInterest, 'compoundInterest() totalInterest');

res = it.get(1000, 5);

t.is(res.value, 4399.83, 'Nesting term value');
t.is(res.totalInterest, 3399.83, 'Nesting term totalInterest');

t.is(res.with[4].values[0], res.with[3].value, 'Nesting term with.value logic');

want = [1344.9, 1808.74, 2432.55, 3271.51, 4399.83]
let got = res.with.map(i => i.value);

t.isJSON(got, want, 'Nesting term with.value results');

want = [344.9, 463.84, 623.81, 838.96, 1128.32]
got = res.with.map(i => i.totalInterest);

t.isJSON(got, want, 'Nesting term with.totalInterest results');

it.nested.set({
  payment: 100,
  preInterest(ctx) { ctx.info.value -= ctx.opts.payment },
});

res = it.get(1000); // Just 1 year needed for this test.

t.is(res.value, -69.17, 'Nesting term with preInterest value');
t.is(res.totalInterest, 130.83, 'NEsting term with preInterst totalInterest');

want = [
  1000, 922.5, 843.06, 761.64, 678.18, 592.63, 504.95, 415.07,
  322.95, 228.52, 131.73, 32.52, -69.17
]
got = res.with[0].values;

t.isJSON(got, want, 'Nesting term with preInterest with.values');

// TODO: test more complex use cases

t.done();

export default t;
