from datetime import datetime
import json
import os
import requests as re


def updateLink(response: re.Response) -> str:
    """
    Updates the link for the next paginated page
    """

    for l in response.headers.get("Link").split(", "):
        if '; rel="next"' in l:
            return l[l.index("https") : l.index(">")]
    return "\0"


def getAllPaginatedData(startLink: str, token: str) -> list:
    """
    Loads paginated data
    """

    data: list = []

    link = startLink
    while link != "\0":
        response = re.get(link, headers={"private-token": token})
        if response.status_code == 200:

            # append data to the list
            paginatedData: list = response.json()
            for item in paginatedData:
                data.append(item)

            # update link for the next paginated page
            link = updateLink(response)
        else:
            print(response.text)
            break

    return data


def getAPIData(pId: str) -> dict:
    """
    Retrieve API Data for Issues and Commits
    """

    info: dict = {"issues": [], "milestones": [], "commits": []}

    token: str = os.environ["PROJECT_TOKEN"]
    url: str = "https://gitlab.devops.telekom.de/api/v4"

    # Milestones
    info["milestones"] = getAllPaginatedData(
        f"{url}/projects/{pId}/milestones?state=closed", token
    )

    # issues
    for milestone in info["milestones"]:
        for issue in getAllPaginatedData(
            f"{url}/projects/{pId}/issues?labels=User+Story&state=closed&milestone={milestone['title']}",
            token,
        ):
            info["issues"].append(issue)

    # commits
    info["commits"] = getAllPaginatedData(
        f"{url}/projects/{pId}/repository/commits", token
    )

    return info


def calculateMetrics(data: dict) -> dict:
    """
    Calculates the metric data and returns it in a specific format
    """
    from config import CONFIG, MetricDataStore

    internalDataStore = MetricDataStore()

    # calculate metric-data

    sprints: list = data["milestones"]
    sprints.reverse()
    userStories: list = data["issues"]
    userStories.reverse()
    deploys: list = data["commits"]
    deploys.reverse()

    deploysForDeplFreq: list = deploys.copy()
    userStoriesCopy: list = userStories.copy()
    userStoriesCopy.sort(key=lambda s: s["milestone"]["title"])

    for sprint in sprints:
        internalDataStore.Labels().append(sprint["title"])

        # attaching user stories to sprints
        sprint["issues"] = []

        for story in userStoriesCopy:
            if story["milestone"]["title"] == sprint["title"]:
                sprint["issues"].append(story)
                userStoriesCopy.remove(story)

        # start and due date of sprint
        startDate: datetime = datetime.strptime(sprint["start_date"], "%Y-%m-%d")
        dueDate: datetime = datetime.strptime(sprint["due_date"], "%Y-%m-%d")

        duration = (
            dueDate.timestamp() * 1000 - startDate.timestamp() * 1000
        ) / CONFIG.Metrics.DeploymentFrequency.TIME_DIVISOR

        # compute deployment frequency
        deployAmount = 0

        for deploy in deploysForDeplFreq:
            authoredDate: datetime = datetime.strptime(
                deploy["authored_date"].split("T")[0], "%Y-%m-%d"
            )

            if authoredDate >= startDate and authoredDate <= dueDate:
                deployAmount += 1
                deploysForDeplFreq.remove(deploy)

        internalDataStore.DeploymentFreqencys().append(
            round(100 * deployAmount / duration) / 100
        )

        # calculating mean lead time
        meanLeadTime = 0

        for story in sprint["issues"]:
            # start and due date of sprint
            storyStartDate: datetime = datetime.strptime(
                story["created_at"].split(".")[0], "%Y-%m-%dT%H:%M:%S"
            )
            storyDueDate: datetime = datetime.strptime(
                story["closed_at"].split(".")[0], "%Y-%m-%dT%H:%M:%S"
            )

            if storyStartDate < startDate:
                storyStartDate = startDate

            duration = (
                storyDueDate.timestamp() * 1000 - storyStartDate.timestamp() * 1000
            ) / CONFIG.Metrics.LeadTimeForChange.TIME_DIVISOR

            meanLeadTime += duration / len(sprint["issues"])

        internalDataStore.MeanLeadTimeForChange().append(
            round(100 * meanLeadTime) / 100
        )

    return internalDataStore.getFormattedData()


def main():
    pId: str = os.environ["PROJECT_ID"]
    apiData = getAPIData(pId)
    calculatedData = calculateMetrics(apiData)

    print(json.dumps(calculatedData, indent=2))

    with open("frontend/public/metric_data.json", "w") as file:
        file.write(json.dumps(calculatedData))


if __name__ == "__main__":
    main()
