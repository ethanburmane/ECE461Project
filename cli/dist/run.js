#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const install_1 = require("./commands/install");
const urlFile_1 = require("./commands/urlFile");
const test_1 = require("./commands/test");
//const { Command } = require("commander");
const figlet = require("figlet");
//const program = new Command();
console.log(figlet.textSync("Package Management Rating System"));
commander_1.program
    .version("0.0.1")
    .description("CLI for package management rating system");
commander_1.program.addCommand((0, install_1.installCommand)());
commander_1.program.addCommand((0, urlFile_1.urlFileCommand)());
commander_1.program.addCommand((0, test_1.testCommand)());
commander_1.program.parse(process.argv);
const mv_dir = (0, child_process_1.exec)('mv dist/run.js dist/run');
const executable = (0, child_process_1.exec)('chmod +x dist/run');
//const npm_build = exec('npm run build');
//const npm_start = exec('npm start');
