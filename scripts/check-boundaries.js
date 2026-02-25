#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const packagesDir = path.join(rootDir, 'packages');
const allowedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts']);
const ignoredDirectories = new Set(['node_modules', 'dist', 'build', '.next', 'coverage']);

const checks = [
  {
    name: 'next/* import',
    regex: /(?:from|import\()\s*['"]next\//g,
  },
  {
    name: 'electron import',
    regex: /(?:from|require\(|import\()\s*['"]electron['"]/g,
  },
  {
    name: 'fs import',
    regex: /(?:from|require\(|import\()\s*['"](?:node:)?fs['"]/g,
  },
];

function listFilesRecursively(dirPath, output) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let index = 0;

  while (index < entries.length) {
    const entry = entries[index];
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        listFilesRecursively(entryPath, output);
      }
    } else if (entry.isFile()) {
      const extension = path.extname(entry.name);
      if (allowedExtensions.has(extension)) {
        output.push(entryPath);
      }
    }

    index += 1;
  }
}

function findViolationsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const violations = [];
  let lineNumber = 0;

  while (lineNumber < lines.length) {
    const line = lines[lineNumber];
    let checkIndex = 0;

    while (checkIndex < checks.length) {
      const check = checks[checkIndex];
      check.regex.lastIndex = 0;
      if (check.regex.test(line)) {
        violations.push({
          filePath,
          lineNumber: lineNumber + 1,
          checkName: check.name,
          sourceLine: line.trim(),
        });
      }
      checkIndex += 1;
    }

    lineNumber += 1;
  }

  return violations;
}

function main() {
  if (!fs.existsSync(packagesDir)) {
    console.log('No packages/ directory found; skipping boundary checks.');
    process.exit(0);
  }

  const files = [];
  listFilesRecursively(packagesDir, files);

  const allViolations = [];
  let fileIndex = 0;
  while (fileIndex < files.length) {
    const fileViolations = findViolationsInFile(files[fileIndex]);
    let violationIndex = 0;
    while (violationIndex < fileViolations.length) {
      allViolations.push(fileViolations[violationIndex]);
      violationIndex += 1;
    }
    fileIndex += 1;
  }

  if (allViolations.length > 0) {
    console.error('Boundary check failed. Forbidden imports found under packages/:');
    let index = 0;
    while (index < allViolations.length) {
      const violation = allViolations[index];
      const relativePath = path.relative(rootDir, violation.filePath);
      console.error(
        '- ' +
          relativePath +
          ':' +
          violation.lineNumber +
          ' [' +
          violation.checkName +
          '] ' +
          violation.sourceLine
      );
      index += 1;
    }
    process.exit(1);
  }

  console.log('Boundary check passed. No forbidden imports found under packages/.');
}

main();
