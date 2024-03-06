import { Project } from "../api/gitlab.graphql.types";

type SeverityString = "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "INFO" | "UNKNOWN";

const DATASETS_BASE: {label: SeverityString, data: {x: number, y: number}[], showLine: boolean}[] = [
    {
        label: "BLOCKER",
        data: [],
        showLine: true,
    },
    {
        label: "CRITICAL",
        data: [],
        showLine: true,
    },
    {
        label: "MAJOR",
        data: [],
        showLine: true,
    },
    {
        label: "MINOR",
        data: [],
        showLine: true,
    },
    {
        label: "INFO",
        data: [],
        showLine: true,
    },
    {
        label: "UNKNOWN",
        data: [],
        showLine: true,
    }
];

export const convertProjectToCodeQualityChartData = (project: Project, xTimestamps: number[]) => {
    const datasets = DATASETS_BASE;

    xTimestamps.forEach(timestamp => {
        const pipeline = project.pipelines?.nodes?.find(p => new Date(p?.commit?.authoredDate).getTime() === timestamp);
        if (pipeline !== undefined && pipeline !== null) {
            pipeline.codeQualityReports?.nodes?.forEach(codeQualityReport => {
                const severity = codeQualityReport?.severity as SeverityString;
                const dataset = datasets.find(dataset => dataset.label === severity);
                if (dataset) {
                    const dataIndex = dataset.data.findIndex(data => data.x === timestamp);
                    if (dataIndex === -1) {
                        dataset.data.push({x: timestamp, y: 1});
                    } else {
                        dataset.data[dataIndex].y++;
                    }
                }
            });
        }
    });

    return datasets;
}
