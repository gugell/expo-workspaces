#!/usr/bin/env node
const { runCli } = require('../build/cli.js');

runCli(process.argv).then(
  (code) => process.exit(code ?? 0),
  (error) => {
    console.error(error);
    process.exit(2);
  },
);
