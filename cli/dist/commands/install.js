"use strict";
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Version: 1.2
// Date: 09/22/2023
// Author: Ashwin Sreedhar
// Description: CLI command for installing dependencies
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
Object.defineProperty(exports, "__esModule", { value: true });
exports.installCommand = void 0;
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const ProgressBar = require("progress");
const logger_1 = require("../logging/logger");
function installCommand() {
    const install = new commander_1.Command('install');
    install
        .description("Installs any dependencies in userland")
        .action(() => {
        console.log("Installing dependencies...");
        //Log here for starting dependency install
        logger_1.logger.debug("Starting dependency installation", { dependencies: "", timestamp: new Date() });
        const totalPackages = 7; // Estimate the total number of packages to be installed
        const bar = new ProgressBar(':bar :percent', { total: totalPackages });
        let installedPackages = 0;
        const npmInstall = (0, child_process_1.exec)('npm install child_process commander figlet progress isomorphic-git dotenv typescript jest chalk @types/node');
        //Log below success/failure of install
        if (npmInstall.stdout) {
            npmInstall.stdout.on('data', (data) => {
                // Here you can parse the data to get more accurate progress (if possible)
                logger_1.logger.debug("Installed package ", { timestamp: new Date() });
                installedPackages += 1;
                bar.tick();
                if (installedPackages >= totalPackages) {
                    bar.terminate();
                }
            });
        }
        npmInstall.on('close', (code) => {
            if (code !== 0) {
                console.error(`\nInstallation process exited with code ${code}`);
                logger_1.logger.error("Issue when installing dependency ", { dependency: "", timestamp: new Date() });
            }
            else {
                bar.update(1);
                console.log('\nInstallation completed successfully');
            }
        });
    });
    return install;
}
exports.installCommand = installCommand;
