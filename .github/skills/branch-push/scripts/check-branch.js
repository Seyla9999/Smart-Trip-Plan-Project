#!/usr/bin/env node

/**
 * Quick reference script for branch-push skill
 * Shows current branch, status, and suggests correct target branch
 */

const { execSync } = require('child_process');
const path = require('path');

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

// Get current branch
const currentBranch = exec('git branch --show-current');

// Get current working directory relative to repo root
const repoRoot = exec('git rev-parse --show-toplevel');
const currentDir = process.cwd();
const relativeDir = currentDir.replace(repoRoot, '').replace(/^[\\\/]/, '');

// Detect context
let suggestedBranch = 'Rin-Nairith'; // Default to frontend
let context = 'Frontend';

if (relativeDir.startsWith('backend')) {
  suggestedBranch = 'Rin-Nairith-backend';
  context = 'Backend';
}

// Get status
const status = exec('git status --short');
const hasChanges = status && status.length > 0;

console.log('═══════════════════════════════════════════════════');
console.log('   Branch Push - Quick Reference');
console.log('═══════════════════════════════════════════════════');
console.log('');
console.log(`Current Branch:    ${currentBranch || '(none)'}`);
console.log(`Current Directory: ${relativeDir || '(root)'}`);
console.log(`Detected Context:  ${context}`);
console.log(`Suggested Branch:  ${suggestedBranch}`);
console.log('');

if (currentBranch !== suggestedBranch) {
  console.log(`⚠️  WARNING: You're on '${currentBranch}' but '${suggestedBranch}' is suggested for ${context.toLowerCase()} work`);
  console.log('');
}

if (hasChanges) {
  console.log('Uncommitted Changes:');
  console.log(status);
  console.log('');
} else {
  console.log('✓ No uncommitted changes');
  console.log('');
}

console.log('Branch Mapping:');
console.log('  Frontend (src/, public/, components/, root) → Rin-Nairith');
console.log('  Backend (backend/)                         → Rin-Nairith-backend');
console.log('');
console.log('═══════════════════════════════════════════════════');
