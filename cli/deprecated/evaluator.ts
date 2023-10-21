
import { Correctness, Metric, BusFactor, ResponsiveMaintainer, License, RampUp, Metric_interface } from "./metrics";
import { NPM_api_engine } from "./api";
import { Package } from "./package";


export class Score 
{
    private total: number;
    private metric_scores: Object;

    constructor()
    {
        this.total = NaN;

        //Format {metric_name: score (0..1)}

        this.metric_scores = {};
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Parameters: 
    //  param :Metric_interface: metric
    //  param :number: score
    // Output: None
    // Associated: 
    // Description: Adds a metric's score to the object.
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    public add_score(metric: Metric_interface, score: number)
    {
        this.metric_scores[metric.get_name()] = score;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Parameters: None
    // Output: None
    // Associated: 
    // Description: Gets the total (overall) score
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    public get_total()
    {
        return this.total;
    }

    public get_metric_scores()
    {
        return this.metric_scores;
    }
}

export class Evaluator
{
    private metrics: Array<Metric_interface>;
    private npm_engine: NPM_api_engine;

    constructor()
    {
        this.metrics = [];
        this.npm_engine = new NPM_api_engine();

        //Do for each metric
        let correctness = new Correctness();
        this.metrics.push(correctness);

        let bus_factor = new BusFactor();
        this.metrics.push(bus_factor);

        let responsive_maintainer = new ResponsiveMaintainer();
        this.metrics.push(responsive_maintainer);

        let license = new License();
        this.metrics.push(license);

        let ramp_up = new RampUp();
        this.metrics.push(ramp_up);

    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Parameters: 
    //  param :string: package_name
    //  param :Object: metadata
    // Output: 
    // Associated: 
    // Description: 
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    public evaluate(pkg: Package)
    {
        //Loop through each metric and get score
        let score = new Score();
        
        //for each metric
        //Metric.score() will take a package and do whatever it needs with the api engines available to the Metrics
        // and will return the calculated score, normalized to be between 1 and 0.
        for (let m = 0; m < this.metrics.length; m++)
        {
            score.add_score(this.metrics[m], this.metrics[m].score(pkg));
        }
        // Do net score 
        return score;
    }
    
}