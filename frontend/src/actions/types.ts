export type GITLAB_MILESTONE = {
    id: number,
    title: string,
    start_date: string,
    due_date: string
};

export type GITLAB_ISSUE = {
    id: any;
    title: string,
    closed_at?: string,
    created_at: string,
    milestone?: GITLAB_MILESTONE
};

export type CustomFile = {
    name: string,
    size: number
}

export type GITLAB_COMMIT = {
    id: string,
    authored_date: string
}

export type CHART_DATASET = {
    label: string,
    data: number[] | {
        x: number,
        y: number
    }[],
    backgroundColor?: string,
    borderColor?: string,
    fill?: string,
    tension?: number,
    showLine?: boolean
};

export type CHART_DATA_ATTRIBUTE = {
    labels: string[],
    datasets: (CHART_DATASET)[]
}
