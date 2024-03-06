import { Project } from "./gitlab.graphql.types";

export const getProjectFromGraphQL = async (gitlabToken: string) => {
    // datasets
    const query = `query {
        project(fullPath: "dominik.mandok/gmd") {
            vulnerabilities(sort: detected_desc) {
                nodes {
                    detectedAt
                    resolvedAt
                    dismissedAt
                    severity
                }
            }
            pipelines {
                nodes {
                    codeQualityReports {
                        nodes {
                            severity
                        }
                    }
                    commit {
                        authoredDate
                    }
                }
            }
        }
      }`;

    const graphqlResponse = await fetch("https://gitlab.devops.telekom.de/api/graphql", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'private-token': gitlabToken
        },
        body: JSON.stringify({ "query": query })
    }).then(res => res.json());

    return graphqlResponse.data.project as Project;
}
