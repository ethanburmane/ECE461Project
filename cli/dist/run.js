"use strict";
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Version: 1.2
// Date: 09/23/2023
// Author: Ashwin Sreedhar
// Description: CLI command for installing dependencies
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const commander_1 = require("commander");
const PKG_1 = require("./PKG");
const install_1 = require("./commands/install");
const test_1 = require("./commands/test");
const fs_1 = require("fs");
const metrics_1 = require("./metrics");
function CLI() {
    const program = new commander_1.Command();
    //const figlet = require("figlet");
    //onsole.log(figlet.textSync("Package Management Rating System"));
    program
        .version("0.0.1")
        .description("CLI for package management rating system");
    program.addCommand((0, install_1.installCommand)());
    program
        .arguments('<filePath>')
        .description("Parses a file of URLs and return the metrics for each URL")
        .action(async (filePath) => {
        /*
        type metrics = {
            NET_SCORE: number,
            LICENSE_SCORE: number,
            CORRECTNESS_SCORE: number,
            RAMP_UP_SCORE: number,
            RESPONSIVE_MAINTAINER_SCORE: number,
            BUS_FACTOR_SCORE: number
        }*/
        try {
            const fileContent = (0, fs_1.readFileSync)("filePath", "utf-8");
            const urls = fileContent.split("\n").map(url => url.trim()).filter(url => url.length > 0);
            // create a list of packages
            let packages = [];
            urls.forEach(url => {
                const pckg = new PKG_1.Package(url, "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");
                packages.push(pckg);
            });
            packages.forEach(pckg => {
                /*
                const bus_factor_score = new BusFactor();
                const correctness_score = new Correctness();
                const license_score = new License();
                const ramp_up_score = new RampUp();
                const responsiveness_score = new ResponsiveMaintainer();
                */
                // cloning the repo and adding the temporary directory name to the package object
                const temp_dir = (0, PKG_1.Clone_Repo)(pckg.owner, pckg.repo);
                pckg.temp_dir = temp_dir;
                const net_score = new metrics_1.NetScore();
                /*
                pckg.CorrectnessScore = correctness_score.score(pckg);
                pckg.BusFactorScore = bus_factor_score.score(pckg);
                //pckg.LicenseScore = license_score.score(pckg);
                pckg.RampUpScore = ramp_up_score.score(pckg);
                pckg.MaintenanceScore = responsiveness_score.score(pckg);
                */
                pckg.Netscore = net_score.score(pckg);
                // deleting the temporary directory
                (0, PKG_1.Delete_Repo)(pckg.temp_dir);
            });
            // print out the metrics for each package
            /*
            packages.forEach(pckg => {
                console.log(pckg.url);
                console.log("NET_SCORE: " + pckg.Netscore);
                //console.log("LICENSE_SCORE: " + pckg.LicenseScore);
                console.log("CORRECTNESS_SCORE: " + pckg.CorrectnessScore);
                console.log("RAMP_UP_SCORE: " + pckg.RampUpScore);
                console.log("RESPONSIVE_MAINTAINER_SCORE: " + pckg.MaintenanceScore);
                console.log("BUS_FACTOR_SCORE: " + pckg.BusFactorScore);
                console.log("NET_SCORE: " + pckg.Netscore);
            })
            */
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
    });
    program.addCommand((0, test_1.testCommand)());
    program.parse(process.argv);
}
exports.CLI = CLI;
//const mv_dir = exec('cp dist/run.js dist/run');
//const executable = exec('chmod +x dist/run');
//const npm_build = exec('npm run build');
//const npm_start = exec('npm start');
