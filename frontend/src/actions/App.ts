import { GitlabAPI, Project } from "./api/gitlabapi";
import { cookieExists, getCookie, setCookie } from "./cookies";

export const checkToken = (tokenName: string) => {
    let gitlabToken: string = "";
    if (cookieExists(tokenName))
      gitlabToken = getCookie(tokenName);
    else {
      gitlabToken = String(prompt("Project Access Token (Gitlab)"));
      setCookie(tokenName, gitlabToken);
    }
    return gitlabToken;
}

export const getProjectData = async (pId: string, gitlabToken: string): Promise<Project> => {
    // Data retrieval
    const gitlabapi = new GitlabAPI("https://gitlab.devops.telekom.de/api/v4/", gitlabToken);
    const gitlabProject: Project = await gitlabapi.getProject(pId);

    return gitlabProject;
}