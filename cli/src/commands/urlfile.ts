import { Command } from 'commander';
import { Package } from '../package';
import { NPM_handler } from "../handlers";
import { readFileSync } from "fs";

export function urlFileCommand() {
    const urlFilePath = new Command();
  
    urlFilePath
        .arguments('<filePath>')
        .description("Parses a file of URLs and return the metrics for each URL")
        .action((filePath) => {

          try {
              const fileContent = readFileSync("filePath", "utf-8");
              const urls = fileContent.split("\n").map(url => url.trim()).filter(url => url.length > 0);

              const url_list: string[] = [];

              urls.forEach(url => { 
                  url_list.push(url);
              });
            
              // We have the file of URLs passed in through the command line
              let pkgs = create_packages(url_list); 
              let scores = score_packages(pkgs); // returns json with format {"url": Score} 

          } catch (error) {
              console.log(error);
              process.exit(1);
          }
        })

    return urlFilePath;
}

export function create_packages(url_list : Array<string>) : Array<Package> { 
  let pkgs = [];
  for (let i = 0; i < url_list.length; i++)
  {
    let p = new Package(url_list[i]);
    pkgs.push(p);
  }

  return pkgs;
}

export function score_packages(pkgs : Array<Package>)
{
  // let npm_handler = new NPM_handler();

  // let scores: any = {};

  
  // for (let i = 0; i < pkgs.length; i++)
  // {
  //   if (pkgs[i].get_domain() == "npm")
  //   {
  //     let s = npm_handler.evaluate(pkgs[i]);
  //     scores[pkgs[i].get_url()] = s;
  //   }
  //   else {}
  // }
  // return scores;
}

// export function output_scores(scores: Array<Score>)
// {
//   scores.forEach((s) =>
//     {
//       s.print();
//     });
// }