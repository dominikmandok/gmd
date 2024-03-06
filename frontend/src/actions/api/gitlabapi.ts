import { Config } from "../config";
import { GITLAB_COMMIT, GITLAB_ISSUE, GITLAB_MILESTONE } from "../types";
import { API, Metric } from "./api";

export class GitlabAPI implements API {
    constructor(private readonly _base_url: string, private readonly _token: string) {}


    private async getPaginatedData<T>(endpoint: string): Promise<T[]> {
        let linkHeader: string = "";
        let link: string = `${endpoint}`;

        let data: T[] = [];

        do {
            // send the request
            const response = await fetch(link, {
                method: 'GET',
                headers: { "private-token": this._token }
            });

            // use data
            if (response.status === 200) {
                const apiData: T[] = await response.json();
                data.push(...apiData);

                // set next link
                linkHeader = String(response.headers.get('Link'));
                const links = linkHeader.split(', ');
                // eslint-disable-next-line no-loop-func
                links.forEach(linkInHeader => {
                    if (linkInHeader.includes('rel="next"')) {
                        const bracketedLink = linkInHeader.split("; rel=\"next\"")[0];
                        link = bracketedLink.substring(1, bracketedLink.length - 1);
                    }
                });
            } else 
                throw new Error(response.statusText);
            
        } while (linkHeader.includes("; rel=\"next\""));

        return data;
    }
    
    async getProject(pId: string): Promise<Project> {
        let pName: string = "";
        let pDescription: string = "";
        
        // Get project data
        const PROJECTS_ENDPOINT: string = this._base_url + "projects/" + pId;

        const projectResponse = await fetch(PROJECTS_ENDPOINT, {
            method: 'GET',
            headers: { "private-token": this._token }
        });

        if (projectResponse.status === 200) {
            const json = await projectResponse.json();
            pName = json['name'];
            pDescription = json['description'];
        } else
            throw new Error(projectResponse.statusText);


        const p: Project = { id: pId, name: pName, description: pDescription, Sprints: [], UserStories: []};

        await this.getSprints(p, 1);
        await this.getUserStories(p, p.Sprints);

        return p;
    }
    
    async getUserStories(project: Project, fromSprints: Sprint[] | undefined = undefined): Promise<UserStory[]> {
        const pId = project.id;

        let userStories: UserStory[] = [];
        
        if (fromSprints === undefined) {
            const ISSUES_ENDPOINT: string = `${this._base_url}projects/${pId}/issues?labels=User+Story`;
            const issues = await this.getPaginatedData<GITLAB_ISSUE>(ISSUES_ENDPOINT);

            issues.forEach(issue => {
                const milestoneID = issue.milestone !== undefined ? issue.milestone.id : undefined;

                if (milestoneID !== undefined) {
                    let sprint = project.Sprints.find(s => s.id === milestoneID);
                    if (sprint !== undefined) {
                        let us: UserStory = { title: issue.title, startDate: new Date(issue.created_at), finishDate: issue.closed_at !== undefined ? new Date(issue.closed_at) : undefined, Sprint: sprint, Metrics: []};
                        sprint.UserStories.push(us);
                        userStories.push(us);
                    } else 
                        throw new Error("This milestone should be here o_O");
                } else {
                    userStories.push({ title: issue.title, startDate: new Date(issue.created_at), finishDate: issue.closed_at !== undefined ? new Date(issue.closed_at) : undefined, Sprint: undefined, Metrics: []});
                }

            });
        } else if (fromSprints.length === 0) {
            const ISSUES_ENDPOINT = `${this._base_url}projects/${pId}/issues?labels=User+Story&milestone=None`;
            const issues = await this.getPaginatedData<GITLAB_ISSUE>(ISSUES_ENDPOINT);

            issues.forEach(issue => userStories.push({ title: issue.title, startDate: new Date(issue.created_at), finishDate: issue.closed_at !== undefined ? new Date(issue.closed_at) : undefined, Sprint: undefined, Metrics: []}));
        } else {
            const MILESTONES_ENDPOINT = `${this._base_url}projects/${pId}/milestones`;

            for (const sprint of fromSprints) {
                const MILESTONE_ISSUES_ENDPOINT = `${MILESTONES_ENDPOINT}/${sprint.id}/issues?labels=User+Story`;
                const issues = await this.getPaginatedData<GITLAB_ISSUE>(MILESTONE_ISSUES_ENDPOINT);

                issues.forEach(issue => {
                    const us: UserStory = { title: issue.title, startDate: new Date(issue.created_at), finishDate: (issue.closed_at !== undefined && issue.closed_at !== null) ? new Date(issue.closed_at) : undefined, Sprint: sprint, Metrics: []};
                    sprint.UserStories.push(us);
                    userStories.push(us);
                });
            }
        }

        project.UserStories = userStories;

        return userStories;
    }

    async getSprints(project: Project, last: number = 0): Promise<Sprint[]> {
        const pId = project.id;
        const MILESTONES_ENDPOINT = `${this._base_url}projects/${pId}/milestones`;

        // load milestones/sprints
        const milestones = await this.getPaginatedData<GITLAB_MILESTONE>(MILESTONES_ENDPOINT);
        milestones.sort((a, b) => new Date(a.due_date) > new Date(b.due_date) ? -1 : 1);

        let milestoneList: Sprint[] = [];

        for (const milestone of milestones) {
            const startDate = new Date(milestone.start_date);
            const dueDate = new Date(milestone.due_date);
            dueDate.setHours(23, 59, 59, 999);
            
            if ((startDate.getTime() <= Date.now() && Date.now() <= dueDate.getTime()) || dueDate.getTime() < Date.now()) {
                // load commits
                const commits = await this.getPaginatedData<GITLAB_COMMIT>(`${this._base_url}projects/${pId}/repository/commits?ref_name=${Config.Repository.DEFAULT_BRANCH}&order=default&since=${startDate.toISOString()}&until=${dueDate.toISOString()}`);

                let s: Sprint = {
                    title: milestone.title, startDate: startDate, dueDate: dueDate, id: milestone.id, Deploys: [], UserStories: [],
                    Metrics: []
                };
                milestoneList.push(s);
            
                for (const commit of commits) {
                    const authored_date = new Date(commit.authored_date);
                    if (startDate.getTime() <= authored_date.getTime() && authored_date.getTime() <= dueDate.getTime()) {
                        s.Deploys.push(commit);
                    }
                }

                if (milestoneList.length >= last)
                    break;
            }
        }

        project.Sprints = milestoneList;

        return milestoneList;
    }
    
}

export interface Project {
    id: string
    name: string
    description: string
    Sprints: Sprint[]
    UserStories: UserStory[]
}

export interface UserStory {
    title: string
    startDate: Date
    finishDate?: Date
    Sprint?: Sprint
    Metrics: Metric[]
}

export interface Sprint {
    UserStories: UserStory[]
    Deploys: GITLAB_COMMIT[]
    Metrics: Metric[]
    id: number
    title: string
    startDate?: Date
    dueDate?: Date
}

export interface Language {
    name: string
    percentage: number
}
