import Tests from '@lumjs/tests';
import * as Int from '../lib/interest.js';

const plan = 0;
const t = Tests.new({module: import.meta, plan});

let builder = Int.buildInterest();
t.isa(builder, Int.InterestBuilder, 'buildInterest() returned builder');

let it = builder
  .term('month', 7.25)
  .term('year', 12)
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

// TODO: finish this

t.done();

export default t;
