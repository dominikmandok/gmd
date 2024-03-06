import { Project, Sprint, UserStory } from '../../src/actions/api/gitlabapi';
import { GITLAB_COMMIT } from '../../src/actions/types';
import { calcAllMetricsOnObjects } from '../../src/actions/calc';

describe('Testing calc.ts', () => {
    
    const oneDay: number = 1000 * 60 * 60 * 24;

    const deploy1: GITLAB_COMMIT = {
        id: '1',
        authored_date: new Date(0).toISOString()
    };
    const usWOMetrics: UserStory = {
        title: 'test',
        Metrics: [],
        startDate: new Date(0),
        finishDate: new Date(oneDay),
        Sprint: undefined
    };
    const sprintWOMetrics: Sprint = {
        id: 1,
        title: 'test',
        Deploys: [deploy1],
        Metrics: [],
        UserStories: [usWOMetrics],
        startDate: new Date(0),
        dueDate: new Date(oneDay)
    };
    usWOMetrics.Sprint = sprintWOMetrics;
    const projectWOMetrics: Project = {
        id: "1",
        name: 'test',
        description: 'test',
        Sprints: [sprintWOMetrics],
        UserStories: [usWOMetrics],
    };

    test('calcAllMetricsOnObjects', () => {
        calcAllMetricsOnObjects(projectWOMetrics);
        
        const sprint: Sprint = projectWOMetrics.Sprints[0];
        expect(sprint.Metrics.length).toBe(2);
        expect(sprint.Metrics[0].name).toBe('Deployment Frequency');
        expect(sprint.Metrics[0].value).toBe(1 / oneDay);
        expect(sprint.Metrics[1].name).toBe('Mean Lead Time for Changes');
        expect(sprint.Metrics[1].value).toBe(oneDay);

        const us: UserStory = projectWOMetrics.UserStories[0];
        expect(us.Metrics.length).toBe(1);
        expect(us.Metrics[0].name).toBe('Lead Time for Changes');
        expect(us.Metrics[0].value).toBe(oneDay);
    });

});