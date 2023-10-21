// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Version: 1.1
// Date: 09/22/2023
// Author: Ashwin Sreedhar
// Description: CLI command for parsing user input for file URL
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

import { Command, program } from 'commander';
import { Package } from '../PKG';
//import { NPM_handler } from "../handlers";
import { readFileSync } from "fs";

export function urlFileCommand() {
    //const urlFilePath = new Command();
  
    program
        .arguments('<filePath>')
        .description("Parses a file of URLs and return the metrics for each URL")
        .action((filePath) => {

            try {
                const fileContent = readFileSync("filePath", "utf-8");
                const urls = fileContent.split("\n").map(url => url.trim()).filter(url => url.length > 0);
/*
                urls.forEach(url => { 
                    url_handler(url);
                })
              */
              // place urls into list
            } catch (error) {
                console.log(error);
                process.exit(1);
            }
        })

    program.parse(process.argv);
    //return urlFilePath;
}
