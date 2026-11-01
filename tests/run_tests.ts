// APEXMOTION TELEMETRY LAB 3D — Master Automated Verification Suite Runner
// Executes Mathematics, Telemetry Validation, Vehicle Dynamics, Lap Comparison, and Circuit/Adapter suites.

import { runMathematicsTests } from './physics_and_replay.test';
import { runValidationTests } from './validation.test';
import { runDynamicsTests } from './dynamics.test';
import { runComparisonTests } from './comparison.test';
import { runCircuitAndAdapterTests } from './circuit_and_adapter.test';

console.log('================================================================');
console.log('   APEXMOTION TELEMETRY LAB 3D — SCIENTIFIC VERIFICATION SUITE   ');
console.log('================================================================\n');

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const suites: { suiteName: string; run: () => TestResult[] }[] = [
  { suiteName: 'Suite 1: Core Mathematics & Spline Interpolation', run: runMathematicsTests },
  { suiteName: 'Suite 2: Phase Three — Telemetry Data Validation & Edge Cases', run: runValidationTests },
  { suiteName: 'Suite 3: Phase Six — Lap Alignment & Known-Answer Comparisons', run: runComparisonTests },
  { suiteName: 'Suite 4: Phase Seven — Longitudinal Dynamics & Dimensional Physics', run: runDynamicsTests },
  { suiteName: 'Suite 5: Milestone 2 & 5 — Circuit Geometry, OpenF1 Schemas & Non-Overlap Invariants', run: runCircuitAndAdapterTests },
];

let totalPassed = 0;
let totalFailed = 0;

for (const suite of suites) {
  console.log(`▶ ${suite.suiteName}`);
  const results = suite.run();

  for (const res of results) {
    if (res.passed) {
      console.log(`    ✓ PASS: ${res.name}`);
      totalPassed++;
    } else {
      console.error(`    ✗ FAIL: ${res.name} — ${res.message}`);
      totalFailed++;
    }
  }
  console.log('');
}

console.log('----------------------------------------------------------------');
console.log(`TOTAL EXECUTED: ${totalPassed + totalFailed} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);

if (totalFailed === 0) {
  console.log('ALL VERIFICATION & RELIABILITY TEST SUITES PASSED DETERMINISTICALLY.');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error('VERIFICATION SUITE DETECTED FAILURES. ABORTING.');
  console.log('================================================================\n');
  process.exit(1);
}
