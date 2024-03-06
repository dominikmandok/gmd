import { ScaleTable } from "@telekom/scale-components-react";
import { Project } from "../../actions/api/gitlabapi";
import { calcAllMetricsOnObjects } from "../../actions/calc";
import { getMetrics } from "../../actions/overview/Metrics";
import LoadingSpinner from "../misc/LoadingSpinner";

interface Props {
  project: Project | null
}

const MetricsCard = (props: Props) => {
  if (props.project === null) {
    return (
      <LoadingSpinner />
    );
  }

  // use data for calculations
  calcAllMetricsOnObjects(props.project);

  const metrics = getMetrics(props.project);

  return (
    <div id="metrics">
      <ScaleTable>
        <thead>
          <tr>
            <th>Metrik</th>
            <th>Wert</th>
            <th>Einheit</th>
          </tr>
        </thead>
        <tbody>
        {
        metrics.map((metric, index) => {
          return (
            <tr key={index}>
              <td>{metric.name}</td>
              <td>{metric.value}</td>
              <td>{metric.unit}</td>
            </tr>
          );
        })
        }
        </tbody>
      </ScaleTable>
    </div>
  );
}

export default MetricsCard;