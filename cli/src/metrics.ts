
import { exec, ChildProcess } from 'child_process';
import { Package } from './PKG';
import { commit } from "isomorphic-git";
import { get } from "http";
import axios from "axios";
import { logger } from "./logging/logger";
import { time } from "console";
import { GitHub_api_engine } from './api';

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// This is the interface for the metrics. It requires each class that implements it to have a 
// name, a get_name() function, and a score() function.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export interface Metric {
    name: string;
    get_name(): string;
    score(pkg: Package): number;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
//The Correctness class calculates a correctness score for a software package or repository.
// It uses the GitHub API to fetch the counts of open and closed issues and computes a score 
//as the ratio of closed issues to the total,
// ensuring it falls between 0 and 1. This score measures code quality and issue resolution, 
// with higher values indicating better correctness. //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export class Correctness implements Metric {
    public githubApiEngine: GitHub_api_engine;

    constructor() {
        this.githubApiEngine = new GitHub_api_engine();
    }

    // Function to get the total number of open issues
    public async getOpenIssues(owner: string, repo: string): Promise<number> {
        try {
            const openIssues = await this.githubApiEngine.getOpenIssues(owner, repo);
            return openIssues.length;
        } catch (error) {
            // Handle errors gracefully
            console.error('Error fetching open issues:', error);
            return 0;
        }
    }

    // Function to get the total number of closed issues
    public async getClosedIssues(owner: string, repo: string): Promise<number> {
        try {
            const closedIssues = await this.githubApiEngine.getClosedIssues(owner, repo);
            return closedIssues.length;
        } catch (error) {
            // Handle errors gracefully
            console.error('Error fetching closed issues:', error);
            return 0;
        }
    }

    // Function to calculate correctness score based on issue ratio
    public score(pkg: Package): number {
        try {
            const owner = '';
            const repo = '';

           // Await the Promises and cast them as numbers
           const totalOpenIssues = Number(this.getOpenIssues(owner, repo));
           const totalClosedIssues = Number(this.getClosedIssues(owner, repo));

            // Calculate the issue ratio
            const issueRatio = totalClosedIssues / (totalOpenIssues + totalClosedIssues);

            // Ensure issueRatio is between 0 and 1
            const correctnessScore = Math.min(Math.max(issueRatio, 0), 1);

            // Log the result
            console.log('Correctness score calculated:', correctnessScore);

            return correctnessScore;
        } catch (error) {
            // Handle errors gracefully and return a default value if necessary
            console.error('Error calculating correctness score:', error);
            return 0;
        }
    }
}


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// This class contains the bus factor metric. The bus factor metric is calculated by using git 
// metadata to determine the percentage of total commits that came from the top commiter, the 
// percentage of total commits that came from the top five commiter, and the number of committers. 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export class BusFactor implements Metric {

    name = "BUS_FACTOR_SCORE";

    public get_name(): string {
        return this.name;
    }

    public score(pkg: Package): number {
        const temp_dir: string = "";

        // setting the constants for the bus factor score
        const func_steepness = 0.1;
        const top_commiter_weight = 0.3;
        const top_x_commiter_weight = 0.3;
        const number_committers_weight = 0.4;

        // retreiving the fields needed to calculate the bus factor score
        const top_commiter_perc = this.get_top_committer_perc(temp_dir);
        const top_x_commiter_perc = this.get_top_x_committer_perc(temp_dir);
        const number_committers = this.get_number_committers(temp_dir);

        // calculating the bus factor score
        const top_commiter_perc_func = 1 / (1 + Math.exp(-func_steepness * (top_commiter_perc - 0.5)));
        const top_x_commiter_perc_func = 1 / (1 + Math.exp(-func_steepness * (top_x_commiter_perc - 0.5)));
        const number_committers_func = 1 / (1 + Math.exp(-func_steepness * number_committers));
        const bus_factor_score = (top_commiter_weight * top_commiter_perc_func)
            + (top_x_commiter_weight * top_x_commiter_perc_func)
            + (number_committers_weight * number_committers_func);
        logger.info("bus factor score calculated", {
            msg: "bus factor score calculated",
            module: "BusFactor.prototype.score",
            timestamp: new Date()
        });
        return bus_factor_score;
    }

    public get_top_committer_perc(temp_dir: string): number {

        // switching to the correct directory
        try {
            process.chdir(temp_dir);
        } catch (error) {
            logger.error("could not change directory to temp directory", {
                msg: "could not change directory to temp directory",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }

        // retrieving the number of commits 
        let commit_count: number;
        try {
            const commit_count_output = execSync(`git rev-list --count --all`, { encoding: 'utf-8' });
            commit_count = +commit_count_output;
        } catch (error) {
            logger.error("could not retrieve number of commits", {
                msg: "could not retrieve number of commits",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }

        // retrieving the number of commits from the top committer and calculating the percentage
        let commit_list_output: string;
        try {
            commit_list_output = execSync('git shortlog -s -n', { encoding: 'utf-8' });
        } catch (error) {
            logger.error("could not retrieve number of commits from top committer", {
                msg: "could not retrieve number of commits from top committer",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }
        const first_num = commit_list_output.match(/\d+/);
        if (first_num === null) {
            logger.error("could not retrieve number of commits from top committer", {
                msg: "could not retrieve number of commits from top committer",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }
        const top_commits = parseInt(first_num[0], 10)
        const top_committer_perc = top_commits / commit_count;
        logger.info("top committer percentage calculated", {
            msg: "top committer percentage calculated",
            module: "get_top_commiter_perc",
            timestamp: new Date()
        });
        return top_committer_perc;
    }

    public get_top_x_committer_perc(temp_dir: string): number {

        // switching to the correct directory
        try {
            process.chdir(temp_dir);
        } catch (error) {
            logger.error("could not change directory to temp directory", {
                msg: "could not change directory to temp directory",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }

        // retreiving the number of commits
        let commit_count: number;
        try {
            const commit_count_output = execSync(`git rev-list --count --all`, { encoding: 'utf-8' });
            commit_count = +commit_count_output;
        } catch (error) {
            logger.error("could not retrieve number of commits", {
                msg: "could not retrieve number of commits",
                module: "get_top_x_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }
        // retreiving the number of commits from the top x committers and calculating the percentage
        let commit_list_output: string;
        try {
            commit_list_output = execSync('git shortlog -s -n', { encoding: 'utf-8' });
        } catch (error) {
            logger.error("could not retrieve number of commits from top x committers", {
                msg: "could not retrieve number of commits from top x committers",
                module: "get_top_x_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }
        const first_num = commit_list_output.match(/\d+/);
        if (first_num === null) {
            logger.error("could not retrieve number of commits from top x committers", {
                msg: "could not retrieve number of commits from top x committers",
                module: "get_top_x_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }
        let x = 5;
        let top_x_commits = 0;
        try {
            for (let i = 0; i < x; i++) {
                top_x_commits += parseInt(first_num[i], 10);
            }
        } catch (error) {
            logger.error("x was greater than the number of commits", {
                msg: "x was greater than the number of commits",
                module: "get_top_x_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }
        const top_x_committer_perc = top_x_commits / commit_count;
        logger.info("top x committer percentage calculated", {
            msg: "top x committer percentage calculated",
            module: "get_top_x_commiter_perc",
            timestamp: new Date()
        });
        return top_x_committer_perc;
    }

    public get_number_committers(temp_dir: string): number {

        // switching to the correct directory
        try {
            process.chdir(temp_dir);
        } catch (error) {
            logger.error("could not change directory to temp directory", {
                msg: "could not change directory to temp directory",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }

        // retrieving the number of committers
        let output_buffer: string;
        try {
            output_buffer = execSync(`git log --format='%ae' | sort -u | wc -l`, { encoding: 'utf-8' });
        } catch (error) {
            logger.error("could not retrieve number of committers", {
                msg: "could not retrieve number of committers",
                module: "get_number_committers",
                timestamp: new Date()
            });
            return 0;
        }
        const committer_count_string = parseInt(output_buffer.toString(), 10);
        const committer_count: number = +committer_count_string
        logger.info("number of committers calculated", {
            msg: "number of committers calculated",
            module: "get_number_committers",
            timestamp: new Date()
        });
        return committer_count;
    }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// This class contains the license metric. The license metric is calculated by ...
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export class License implements Metric {

    name = "LICENSE_SCORE";

    public get_name(): string {
        return this.name;
    }

    public score(pkg: Package): number {
        return 0;
    }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// This class contains the ramp up metric. The ramp up metric is calculated by ...
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export class RampUp implements Metric {

    name = "RAMP_UP_SCORE";

    public get_name(): string {
        return this.name;
    }

    public score(pkg: Package): number {
        return 0;
    }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// This class contains the responsive maintainer metric. The responsive maintainer metric is 
// calculated by using git metadata to determine the number of days since the last commit and the
// number of commits in the last thirty days.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export class ResponsiveMaintainer implements Metric {

    name = "RESPONSIVE_MAINTAINER_SCORE";

    public get_name(): string {
        return this.name;
    }

    public score(pkg: Package): number {
        const temp_dir: string = "";

        // setting the constants for the responsive maintainer score
        const function_steepness = 0.1;
        const sigmoid_midpoint = 30;
        const commit_frequency_range = 30;
        const last_commit_weigth = 0.5;
        const commit_frequency_weight = 0.5;

        // retrieving the fields needed to calculate the responsive maintainer score
        const last_commit = this.get_last_commit(temp_dir);
        const commit_frequency = this.get_commit_frequency(temp_dir);

        // calculating the responsive maintainer score
        const last_commit_func = 1 / (1 + Math.exp(-function_steepness * (last_commit - sigmoid_midpoint)));
        const commit_frequency_func = 1 / (1 + Math.exp(-function_steepness * commit_frequency));
        const responsive_maintainer_score = (last_commit_weigth * last_commit_func)
            + (commit_frequency_weight * commit_frequency_func);
        logger.info("responsive maintainer score calculated", {
            msg: "responsive maintainer score calculated",
            module: "ResponsiveMaintainer.prototype.score",
            timestamp: new Date()
        });
        return responsive_maintainer_score;
    }

    public get_last_commit(temp_dir: string): number {

        // switching to the correct directory
        try {
            process.chdir(temp_dir);
        } catch (error) {
            logger.error("could not change directory to temp directory", {
                msg: "could not change directory to temp directory",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }

        // retrieving the date of the last commit
        let last_commit_output: string;
        try {
            last_commit_output = execSync('git log -1 --format=%ai', { encoding: 'utf-8' });

        } catch (error) {
            logger.error("could not retrieve date of last commit", {
                msg: "could not retrieve date of last commit",
                module: "get_last_commit",
                timestamp: new Date()
            });
            return 0;
        }
        const last_commit_date = last_commit_output.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (last_commit_date === null) {
            logger.error("could not retrieve date of last commit", {
                msg: "could not retrieve date of last commit",
                module: "get_last_commit",
                timestamp: new Date()
            });
            return 0;
        }
        const last_commit_year = parseInt(last_commit_date[1], 10);
        const last_commit_month = parseInt(last_commit_date[2], 10);
        const last_commit_day = parseInt(last_commit_date[3], 10);

        // retrieving the current date and calculating the number of days since the last commit
        const today = new Date();
        const lastCommitDate = new Date(last_commit_year, last_commit_month - 1, last_commit_day);
        const time_difference = today.getTime() - lastCommitDate.getTime();
        const last_commit = Math.floor(time_difference / (1000 * 3600 * 24));
        logger.info("number of days since last commit calculated", {
            msg: "number of days since last commit calculated",
            module: "get_last_commit",
            timestamp: new Date()
        });
        return last_commit;
    }

    public get_commit_frequency(temp_dir: string): number {

        // switching to the correct directory
        try {
            process.chdir(temp_dir);
        } catch (error) {
            logger.error("could not change directory to temp directory", {
                msg: "could not change directory to temp directory",
                module: "get_top_commiter_perc",
                timestamp: new Date()
            });
            return 0;
        }

        // getting the number of commits in the last thirty days
        const thirty_days = new Date();
        thirty_days.setDate(thirty_days.getDate() - 30);
        const formatted_date = thirty_days.toISOString().split('T')[0];
        let commit_frequency_output: string;
        try {
            commit_frequency_output = execSync(`git rev-list --count --since="${formatted_date}" HEAD`, { encoding: 'utf-8' });
        } catch (error) {
            logger.error("could not retrieve number of commits in the last thirty days", {
                msg: "could not retrieve number of commits in the last thirty days",
                module: "get_commit_frequency",
                timestamp: new Date()
            });
            return 0;
        }
        const commit_frequency: number = +commit_frequency_output;
        logger.info("number of commits in the last thirty days calculated", {
            msg: "number of commits in the last thirty days calculated",
            module: "get_commit_frequency",
            timestamp: new Date()
        });
        return commit_frequency;
    }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// This class contains the net score metric. The net score metric is calculated by calling the 
// score() function of each of the other metrics and then combining them into a single score.
// The correct JSON formatting is then applied to the score and it is returned.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export class NetScore implements Metric {

    name = "NET_SCORE";

    public get_name(): string {
        return this.name;
    }

    public score(pkg: Package): number {
        const temp_dir = "";
        const url = ""

        // retrieving the scores for each metric
        const bus_factor_score = Math.floor(BusFactor.prototype.score(pkg));
        const responsive_maintainer_score = Math.floor(ResponsiveMaintainer.prototype.score(pkg));
        const correctness_score = Math.floor(Correctness.prototype.score(pkg));
        const ramp_up_score = Math.floor(RampUp.prototype.score(pkg));
        const license_score = Math.floor(License.prototype.score(pkg));

        // setting the constants for the net score
        const bus_factor_weight = 0.2;
        const responsive_maintainer_weight = 0.2;
        const correctness_weight = 0.2;
        const ramp_up_weight = 0.2;
        const license_weight = 0.2;

        // calculating the net score
        const net_score = Math.floor((bus_factor_weight * bus_factor_score)
            + (responsive_maintainer_weight * responsive_maintainer_score)
            + (correctness_weight * correctness_score)
            + (ramp_up_weight * ramp_up_score)
            + (license_weight * license_score));

        // formatting the net score as ndjson and printing it to stdout
        const score_json = [{
            "URL": url,
            "NET_SCORE": net_score,
            "RAMP_UP_SCORE": ramp_up_score,
            "CORRECTNESS_SCORE": correctness_score,
            "BUS_FACTOR_SCORE": bus_factor_score,
            "RESPONSIVE_MAINTAINER_SCORE": responsive_maintainer_score,
            "LICENSE_SCORE": license_score
        }];

        const ndjson_output = score_json.map((obj) => {
            return JSON.stringify(obj);
        }).join('\n');
        process.stdout.write(ndjson_output);
        logger.info("net score calculated", {
            msg: "net score calculated",
            module: "NetScore.prototype.score",
            timestamp: new Date()
        });
        return net_score;
    }
}

