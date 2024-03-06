import json
import os
from datetime import datetime, timedelta
from gitignoreFilter import filterTree

FILENAME_FILTER = (".gitlab-ci.yml", "gitlab.graphql.types.ts")
FILEENDING_FILTER = ("gitignore", "gitkeep", "md")
FOLDER_FILTER = (".git", ".gitlab")

FILEENDING_TO_LANGUAGE = {
    "py": "Python",
    "js": "JavaScript",
    "ts": "TypeScript",
    "css": "CSS",
    "html": "HTML",
    "Dockerfile": "Dockerfile",
    "json": "JSON",
}


def getLanguageSizeOfCommitFiles():
    files = filterTree(".")  # get all files in the current folder and subfolders
    language_and_size: dict = {}

    for file in files:
        fileending = file.split(".")[-1]
        if fileending in FILEENDING_FILTER:
            continue

        if not fileending in language_and_size:
            language_and_size[fileending] = 0

        language_and_size[fileending] += os.path.getsize(file)

    return language_and_size


def getLanguageDistributionOfCurrentCommit() -> dict:
    """
    get Language Size Distribution of the current folder and subfolders
    """

    rawLanguageData = getLanguageSizeOfCommitFiles()
    sizeSum = sum(rawLanguageData.values())

    # get authored date of the current commit
    commitDate: datetime = datetime.strptime(
        os.popen("git show -s --format=%ci").read().strip(), "%Y-%m-%d %H:%M:%S %z"
    )

    commitObject = {
        "date": commitDate.strftime("%Y-%m-%d %H:%M:%S"),
        "languages": {},
        "hash": os.popen("git rev-parse HEAD").read().strip(),
    }

    for fileending in rawLanguageData:
        if fileending in FILEENDING_TO_LANGUAGE:
            commitObject["languages"][FILEENDING_TO_LANGUAGE[fileending]] = {
                "bytes": 0,
                "percentage": 0,
            }
        else:
            if not "Other" in commitObject["languages"]:
                commitObject["languages"]["Other"] = {
                    "bytes": 0,
                    "percentage": 0,
                }

        # adding the percentage of the current fileending to the language
        commitObject["languages"][
            FILEENDING_TO_LANGUAGE[fileending]
            if fileending in FILEENDING_TO_LANGUAGE
            else "Other"
        ]["percentage"] += (round(rawLanguageData[fileending] * 10000 / sizeSum) / 100)

        # adding the bytes of the current fileending to the language
        commitObject["languages"][
            FILEENDING_TO_LANGUAGE[fileending]
            if fileending in FILEENDING_TO_LANGUAGE
            else "Other"
        ]["bytes"] += rawLanguageData[fileending]

    commitObject["languages"] = dict(
        sorted(
            commitObject["languages"].items(),
            key=lambda x: x[1]["percentage"],
            reverse=True,
        )
    )

    return commitObject


def convertedLanguageHistoryData(data: list) -> dict:
    """
    Converts the language history data to a specific format
    """

    chartData = {
        "labels": [],
        "datasetsPercentages": [],
        "datasetsBytes": [],
        "commits": [],
    }
    commitDates: list = []

    # fill the commits array with objects that contain the commit date timestamp and the commit hash
    for commit in data:
        chartData["commits"].append(
            {
                "date": datetime.strptime(
                    commit["date"], "%Y-%m-%d %H:%M:%S"
                ).timestamp()
                * 1000,
                "hash": commit["hash"],
            }
        )

    # reverse list to get chronological order of commits
    data.reverse()

    # iterate over all commits and reformat the data
    for index, commit in enumerate(data):
        commitDates.append(commit["date"])

        for language in commit["languages"]:
            # find the dataset for the current language
            datasetP: dict = next(
                (
                    dataset
                    for dataset in chartData["datasetsPercentages"]
                    if dataset["label"] == language
                ),
                None,
            )

            datasetB: dict = next(
                (
                    dataset
                    for dataset in chartData["datasetsBytes"]
                    if dataset["label"] == language
                ),
                None,
            )

            # if the dataset does not exist, create it
            if datasetP is None:
                datasetP = {"label": language, "data": []}
                chartData["datasetsPercentages"].append(datasetP)

            if datasetB is None:
                datasetB = {"label": language, "data": []}
                chartData["datasetsBytes"].append(datasetB)

            # fill the past data slots with 0
            while len(datasetP["data"]) < index:
                datasetP["data"].append(
                    {
                        "x": datetime.strptime(
                            commitDates[len(datasetP["data"])], "%Y-%m-%d %H:%M:%S"
                        ).timestamp()
                        * 1000,
                        "y": 0,
                    }
                )

            while len(datasetB["data"]) < index:
                datasetB["data"].append(
                    {
                        "x": datetime.strptime(
                            commitDates[len(datasetB["data"])], "%Y-%m-%d %H:%M:%S"
                        ).timestamp()
                        * 1000,
                        "y": 0,
                    }
                )

            # add the current language size to the dataset
            datasetP["data"].append(
                {
                    "x": datetime.strptime(
                        commit["date"], "%Y-%m-%d %H:%M:%S"
                    ).timestamp()
                    * 1000,
                    "y": commit["languages"][language]["percentage"],
                }
            )

            datasetB["data"].append(
                {
                    "x": datetime.strptime(
                        commit["date"], "%Y-%m-%d %H:%M:%S"
                    ).timestamp()
                    * 1000,
                    "y": commit["languages"][language]["bytes"],
                }
            )

    # fill the past data slots with 0
    for datasetP in chartData["datasetsPercentages"]:
        while len(datasetP["data"]) < len(commitDates):
            datasetP["data"].append(
                {
                    "x": datetime.strptime(
                        commitDates[len(datasetP["data"])], "%Y-%m-%d %H:%M:%S"
                    ).timestamp()
                    * 1000,
                    "y": 0,
                }
            )

    for datasetB in chartData["datasetsBytes"]:
        while len(datasetB["data"]) < len(commitDates):
            datasetB["data"].append(
                {
                    "x": datetime.strptime(
                        commitDates[len(datasetB["data"])], "%Y-%m-%d %H:%M:%S"
                    ).timestamp()
                    * 1000,
                    "y": 0,
                }
            )

    # generate labels
    firstCommitDate = datetime.strptime(commitDates[0], "%Y-%m-%d %H:%M:%S")
    lastCommitDate = datetime.strptime(commitDates[-1], "%Y-%m-%d %H:%M:%S")

    numLabels = 10
    labelStep = (lastCommitDate - firstCommitDate).days // numLabels

    chartData["labels"] = [
        (firstCommitDate + timedelta(days=i * labelStep)).strftime("%Y-%m-%d")
        for i in range(numLabels + 1)
    ]

    return chartData


def main():
    commits: list = []

    # store current commit sha
    latestCommitSha = os.popen("git rev-parse HEAD").read().strip()

    # iterate over all commits and get the language distribution into the commits list
    for commit in os.popen("git rev-list --all").read().splitlines():
        os.system("git checkout " + commit)
        commits.append(getLanguageDistributionOfCurrentCommit())

    # reset tree to the latest commit
    os.system(f"git checkout {latestCommitSha}")

    # convert the language history data to a specific format for the frontend
    formattedData = convertedLanguageHistoryData(commits)

    # debug print
    print(json.dumps(formattedData, indent=2))

    # write the languages list into a json file
    with open("frontend/public/language_data.json", "w") as file:
        file.write(json.dumps(formattedData))


if __name__ == "__main__":
    main()
