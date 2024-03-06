import { CHART_DATASET } from "./types";
import { Config } from "./config";
import { convertProjectToSASTChartData } from "./charts/sastChart";
import { OPTIONS_LINE, OPTIONS_SCATTER } from "./charts/builder";
import { Project as ProjectGQL } from "./api/gitlab.graphql.types"
import { convertProjectToCodeQualityChartData } from "./charts/CQChart";
import { ChartData, ChartDataset } from "chart.js";


// filenames
const METRIC_FILE = "metric_data.json";
const LANGUAGE_FILE = "language_data.json";


// metric Chart
const getMetricChartData = async () => {
    // initialize data object for chart
    const data: ChartData<"line"> = {
        datasets: [],
        labels: []
    };

    // get metric Data from json file
    const fileData: ChartData<"line"> = await fetch(`${METRIC_FILE}`).then(file => file.json());
    data['labels'] = fileData.labels;
    const jsonDatasets = fileData.datasets;

    // add dataset label and data to chart data
    for (let i = 0; i < jsonDatasets.length; i++) {
        const dataset = jsonDatasets[i];
        data.datasets[i] = {...Config.Drawer.METRIC_BASE_CONFIG[i], label: dataset['label'], data: dataset['data']};
    }

    // build chart
    return {
        data: data,
        options: OPTIONS_LINE()
    };
}

// language Chart
const getLanguagePercentagesData = async () => {
    // fileData
    const fileData = await fetch(`${LANGUAGE_FILE}`).then(file => file.json());
    const fileDataLabels: string[] = fileData['labels'];

    // labels
    const labels: number[] = [];
    fileDataLabels.forEach(label => labels.push(new Date(label).getTime()) );

    // datasets
    const datasets: ChartDataset<"scatter">[] = [];
    const jsonDatasets: ChartDataset<"scatter">[] = fileData['datasetsPercentages'];

    const languageColors = Config.Drawer.languageColors;

    // commit dates and hashes
    const commits: {date: number, hash: string}[] = fileData['commits'];

    let first = true;
    jsonDatasets.forEach(dataset => {
        const data = dataset['data'];
        const language = dataset['label'] ? dataset['label'] : "Other";
        const color = languageColors.has(language) ? languageColors.get(language) : "rgba(0, 0, 0, 0.3)";

        // create dataset
        const datasetObj: ChartDataset<"scatter"> = {
            label: language,
            data: data,
            backgroundColor: color,
            borderColor: color,
            fill: first ? "origin" : "-1",
            showLine: true,
            tension: 0.15
        };

        if (first) first = false;

        // add dataset to chart
        datasets.push(datasetObj);
    });

    const data: ChartData<"scatter"> = { labels: labels, datasets: datasets };

    return {
        data: data,
        options: OPTIONS_SCATTER(labels, commits, true)
    };
}

const getLanguageBytesData = async () => {
    // fileData
    const fileData = await fetch(`${LANGUAGE_FILE}`).then(file => file.json());
    const fileDataLabels: string[] = fileData['labels'];

    // labels
    const labels: number[] = [];
    fileDataLabels.forEach(label => labels.push(new Date(label).getTime()) );

    // datasets
    const datasets: CHART_DATASET[] = [];
    const jsonDatasets: CHART_DATASET[] = fileData['datasetsBytes'];

    const languageColors = Config.Drawer.languageColors;

    // commit dates and hashes
    const commits: {date: number, hash: string}[] = fileData['commits'];

    jsonDatasets.forEach(dataset => {
        const data = dataset['data'];
        const language = dataset['label'] ? dataset['label'] : "Other";
        const color = languageColors.has(language) ? languageColors.get(language) : "rgba(0, 0, 0, 0.3)";

        // create dataset
        const datasetObj = {
            label: language,
            data: data,
            backgroundColor: color,
            borderColor: color,
            fill: "origin",
            showLine: true,
            tension: 0.15
        };

        // add dataset to chart
        datasets.push(datasetObj);
    });

    const data: ChartData<"scatter"> = { labels: labels, datasets: datasets };

    return {
        data: data,
        options: OPTIONS_SCATTER(labels, commits)
    };
}

const getSASTAndCodeQualityData = async (project: ProjectGQL) => {
    // fileData
    const fileData = await fetch(`${LANGUAGE_FILE}`).then(file => file.json());
    const fileDataLabels: string[] = fileData['labels'];
    const commits: {date: number, hash: string}[] = fileData['commits'];
    const xTimestamps = commits.map(commit => commit.date);

    // labels
    const labels: number[] = [];
    fileDataLabels.forEach(label => labels.push(new Date(label).getTime()) );

    const datasets = convertProjectToSASTChartData(project, xTimestamps);
    const datasetsCq = convertProjectToCodeQualityChartData(project, xTimestamps);

    const sastData: ChartData<"scatter"> = { labels: labels, datasets: datasets };
    const cqData: ChartData<"scatter"> = { labels: labels, datasets: datasetsCq };

    // build charts
    return {
        sastData: {
            data: sastData,
            options: OPTIONS_SCATTER(labels, commits)
        },
        cqData: {
            data: cqData,
            options: OPTIONS_SCATTER(labels, commits)
        }
    };
}

// main function
export async function getAllChartData(project: ProjectGQL) {
    // create metric chart
    const metricData = await getMetricChartData();

    // create language chart
    const langPercData = await getLanguagePercentagesData();

    // create language bytes chart
    const langAbsData = await getLanguageBytesData();

    // create sast chart
    const {sastData, cqData} = await getSASTAndCodeQualityData(project);

    return { metricData, langPercData, langAbsData, sastData, cqData };
}
