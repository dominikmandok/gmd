import { Metric } from "./api/api";
import { Project, Sprint, UserStory } from "./api/gitlabapi";

/**
 * Calculates the metrics for every Sprint and User Story of the project
 * @param project the project
 */
export function calcAllMetricsOnObjects(project: Project) {

    // clear all metrics
    project.Sprints.forEach(sprint => sprint.Metrics = []);
    project.UserStories.forEach(us => us.Metrics = []);
    
    // attach metrics to objects
    project.UserStories.forEach(us => us.Metrics.push(LeadTimeForChangesUS(us)) );

    project.Sprints.forEach(sprint => {
        sprint.Metrics.push(DeploymentFrequencyS(sprint));
        sprint.Metrics.push(LeadTimeForChangesS(sprint));
    });

}

function DeploymentFrequencyS(s: Sprint): Metric {
    let m: Metric = { name: "Deployment Frequency", value: undefined};
    let numDeploys = s.Deploys.length;

    const start = s.startDate!;
    const end = s.dueDate!;
    
    m.value = numDeploys / (end.getTime() - start.getTime());
    
    return m;
}

function LeadTimeForChangesUS(us: UserStory): Metric {
    let m: Metric = { name: "Lead Time for Changes", value: undefined};

    let startDate = us.startDate;
    const sprintStartDate = us.Sprint?.startDate;
    if (sprintStartDate !== undefined && startDate < sprintStartDate)
        startDate = sprintStartDate;
        
    const endDate = us.finishDate;
    if (endDate !== undefined)
        m.value = endDate.getTime() - startDate.getTime();
    else
        m.value = Date.now() - startDate.getTime();

    return m;
}

function LeadTimeForChangesS(s: Sprint): Metric {
    let m: Metric = { name: "Mean Lead Time for Changes", value: undefined};
    const us: UserStory[] = s.UserStories;
    
    let meanLeadTime = 0;

    const usAmount = us.length;
    us.forEach(us => {
        const metric = us.Metrics.find(m => m.name === "Lead Time for Changes");
        if (metric !== undefined && metric.value !== undefined)
            meanLeadTime += metric.value;
        else
            throw new Error("Metric was not calculated by now");
    });

    if (usAmount > 0)
        m.value = meanLeadTime / usAmount;
    
    return m;
}