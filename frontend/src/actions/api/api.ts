export interface API {
    getProject(pId: string): Promise<any>
    getUserStories(project: any, fromSprints: any[] | undefined): Promise<any[]>
    getSprints(project: any, last?: number): Promise<any[]>
}

export interface Metric {
    name: string
    value: number | undefined
}