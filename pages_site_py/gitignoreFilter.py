import os
from gitignore_parser import parse_gitignore

MANUAL_FOLDER_IGNORE = ".git"
MANUAL_FILE_IGNORE = (
    ".gitignore",
    "package-lock.json",
    "gitlab.graphql.types.ts",
    "gitignore_parser.py",
)


def filterTree(base_path: str, ignoreFiles: list = []) -> list:
    dirList = os.listdir(base_path)
    hasIgnoreFile = False
    files = []

    if ".gitignore" in dirList:
        ignoreFiles.append(parse_gitignore(os.path.join(base_path, ".gitignore")))
        hasIgnoreFile = True

    for obj in dirList:
        if os.path.isdir(base_path + "/" + obj):
            if obj not in MANUAL_FOLDER_IGNORE and not any(
                ingore(base_path + "/" + obj) for ingore in ignoreFiles
            ):
                files.extend(filterTree(base_path + "/" + obj, ignoreFiles))
        else:
            filename = obj

            if (
                not any(
                    ignoreFile(base_path + "/" + filename) for ignoreFile in ignoreFiles
                )
                and filename not in MANUAL_FILE_IGNORE
            ):
                files.append(base_path + "/" + filename)

    if hasIgnoreFile:
        ignoreFiles.pop()

    return files
