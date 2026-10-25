// APEX TELEMETRY 3D — Test Suite Runner

import { runMathematicsTests } from './physics_and_replay.test';

console.log('====================================================');
console.log('   APEX TELEMETRY 3D — AUTOMATED VERIFICATION SUITE   ');
console.log('====================================================\n');

const results = runMathematicsTests();
let allPassed = true;

for (const res of results) {
  if (res.passed) {
    console.log(`  ✓ PASS: ${res.name}`);
  } else {
    allPassed = false;
    console.error(`  ✗ FAIL: ${res.name} — ${res.message}`);
  }
}

console.log('\n----------------------------------------------------');
if (allPassed) {
  console.log(`  ALL ${results.length} MATHEMATICAL & REPLAY TESTS PASSED.`);
} else {
  console.error('  SOME TESTS FAILED.');
  process.exit(1);
}
console.log('====================================================\n');
