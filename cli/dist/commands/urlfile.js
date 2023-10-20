"use strict";
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Version: 1.1
// Date: 09/22/2023
// Author: Ashwin Sreedhar
// Description: CLI command for parsing user input for file URL
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlFileCommand = void 0;
const commander_1 = require("commander");
//import { NPM_handler } from "../handlers";
const fs_1 = require("fs");
function urlFileCommand() {
    //const urlFilePath = new Command();
    commander_1.program
        .arguments('<filePath>')
        .description("Parses a file of URLs and return the metrics for each URL")
        .action((filePath) => {
        try {
            const fileContent = (0, fs_1.readFileSync)("filePath", "utf-8");
            const urls = fileContent.split("\n").map(url => url.trim()).filter(url => url.length > 0);
            /*
                            urls.forEach(url => {
                                url_handler(url);
                            })
                          */
            // place urls into list
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
    });
    commander_1.program.parse(process.argv);
    //return urlFilePath;
}
exports.urlFileCommand = urlFileCommand;
