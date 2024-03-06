import { Project } from "../api/gitlabapi";

interface Metric {
    name: string
    value: string
    unit: string
}

export const getMetrics = (project: Project): Metric[] => {
    const metrics: Metric[] = [];

    project.Sprints.forEach(sprint => {
        sprint.Metrics.forEach(metric => {
            if (metric.name === "Mean Lead Time for Changes") {
                metrics.push({
                    name: metric.name,
                    value: metric.value !== undefined ? String(Math.round(100*(metric.value / (1000*60*60*24)))/100) : "-/-",
                    unit: "Tage/Story"
                });
            } else {
                metrics.push({
                    name: metric.name,
                    value: metric.value !== undefined ? String(Math.round(100*(metric.value * 1000 * 60 * 60 * 24))/100) : "-/-",
                    unit: "Deployments/Tag"
                });
            }
        });
    });

    return metrics;
}
