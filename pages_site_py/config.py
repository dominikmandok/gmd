class CONFIG:
    class Metrics:
        class DeploymentFrequency:
            # days
            TIME_DIVISOR = 1000 * 60 * 60 * 24

        class LeadTimeForChange:
            # days
            TIME_DIVISOR = 1000 * 60 * 60 * 24


class Dataset(dict):
    def __init__(self, label: str = "", data: list = []) -> None:
        dict.__init__(self, label=label, data=data)

    def data(self) -> list:
        return dict.get(self, "data")

    def label(self) -> str:
        return dict.get(self, "label")


class MetricDataStore:
    def __init__(self) -> None:
        self._deploymentFrequencys = []
        self._meanLeadTime = []
        self._labels = []

    def DeploymentFreqencys(self) -> list:
        return self._deploymentFrequencys

    def Labels(self) -> list:
        return self._labels

    def MeanLeadTimeForChange(self) -> list:
        return self._meanLeadTime

    def getFormattedData(self) -> dict:
        data = {"labels": [], "datasets": []}
        data["labels"] = self._labels

        # apply datasets

        if len(self._deploymentFrequencys) > 0:
            data["datasets"].append(
                Dataset("Deployment Frequency", self._deploymentFrequencys)
            )

        if len(self._meanLeadTime) > 0:
            data["datasets"].append(
                Dataset("Mean Lead time for change", self._meanLeadTime)
            )

        return data
