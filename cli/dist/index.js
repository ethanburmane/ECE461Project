#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // loads .env file into process.env. NOTE: this should be the first line
const run_1 = require("./run");
(0, run_1.CLI)();
