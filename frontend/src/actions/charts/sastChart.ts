import { Project } from "../api/gitlab.graphql.types";

const DATASETS_BASE: {label: string, data: {x: number, y: number}[], showLine: boolean}[] = [
    {
        label: "CRITICAL",
        data: [],
        showLine: true,
    },
    {
        label: "HIGH",
        data: [],
        showLine: true,
    },
    {
        label: "MEDIUM",
        data: [],
        showLine: true,
    },
    {
        label: "LOW",
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

export const convertProjectToSASTChartData = (project: Project, xTimestamps: number[]) => {
    const datasets = DATASETS_BASE;

    xTimestamps.forEach(timestamp => {
        if (project.vulnerabilities !== undefined && project.vulnerabilities !== null && project.vulnerabilities.nodes !== undefined && project.vulnerabilities.nodes !== null) {
            project.vulnerabilities.nodes.forEach(vulnerability => {
                const detectedAt = new Date(vulnerability?.detectedAt);
                const resolvedAt = new Date(vulnerability?.resolvedAt === null ? timestamp+1 : vulnerability?.resolvedAt);
                const dismissedAt = new Date(vulnerability?.dismissedAt === null ? timestamp+1 : vulnerability?.dismissedAt);

                if (resolvedAt.getTime() <= timestamp || dismissedAt.getTime() <= timestamp || detectedAt.getTime() > timestamp) return;

                const severity = vulnerability?.severity;
        
                const index = datasets.findIndex(dataset => dataset.label === severity?.toString());
        
                if (index !== -1) {
                    const indexInData = datasets[index].data.findIndex(data => data.x === timestamp);

                    if (indexInData !== -1) {
                        datasets[index].data[indexInData].y++;
                    } else {
                        datasets[index].data.push({x: timestamp, y: 1});
                    }
                }
            });
        }
    });

    return datasets;
}
