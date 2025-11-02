const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const binDir = path.join(__dirname, '..', 'functions', 'node_modules', '.bin');
const markerSets = process.platform === 'win32'
  ? [
      ['tsc.CMD', 'tsc.cmd', 'tsc'],
      ['vitest.CMD', 'vitest.cmd', 'vitest'],
    ]
  : [
      ['tsc'],
      ['vitest'],
    ];

const hasDeps = markerSets.every((markers) =>
  markers.some((file) => existsSync(path.join(binDir, file)))
);

if (hasDeps) {
  process.exit(0);
}

const result = spawnSync('npm', ['--prefix', 'functions', 'ci'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error('Failed to ensure Functions dependencies:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
