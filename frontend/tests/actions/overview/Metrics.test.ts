
import { getMetrics } from '../../../src/actions/overview/Metrics';
import { Project } from '../../../src/actions/api/gitlabapi';

describe('Testing Metrics.ts', () => {
    const project: Project = {
        id: "1",
        name: "Test Project",
        description: "Test Description",
        Sprints: [{
            id: 1,
            title: "Test Sprint",
            Metrics: [{
                name: "Mean Lead Time for Changes",
                value: 1728000000
            },
            {
                name: "Deployment Frequency",
                value: 0.00000003
            }],
            Deploys: [],
            UserStories: []
        }],
        UserStories: []
    };

    test('Calculating Mean Lead Time', () => {
        const metrics = getMetrics(project);
        const res = metrics.find(metric => metric.name === "Mean Lead Time for Changes");
        
        expect(res).toBeDefined();
        expect(res).toEqual({
            name: "Mean Lead Time for Changes",
            unit: "Tage/Story",
            value: "20"
        });
    });

    test('Calculating Deployment Frequency', () => {
        const metrics = getMetrics(project);
        const res = metrics.find(metric => metric.name === "Deployment Frequency");
        
        expect(res).toBeDefined();
        expect(res).toEqual({
            name: "Deployment Frequency",
            unit: "Deployments/Tag",
            value: "2.59"
        });
    });
});