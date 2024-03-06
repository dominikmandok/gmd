import json


def updateHomepage():
    package = {}

    with open("frontend/package.json", "r") as f:
        package = json.loads(f.read())
        package["homepage"] = "https://dominik.mandok.pages.devops.telekom.de/gmd"

    with open("frontend/package.json", "w") as f:
        f.write(json.dumps(package, indent=2))
        print("Package.json updated to:")
        print(json.dumps(package, indent=2))


if __name__ == "__main__":
    updateHomepage()
