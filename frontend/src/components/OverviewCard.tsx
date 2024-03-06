import { ScaleCard } from "@telekom/scale-components-react";
import { Project } from "../actions/api/gitlabapi";
import Metrics from "./overview/Metrics";
import ProjectInfo from "./overview/Project";

interface Props {
  id?: string
  project: Project | null
}

const OverviewCard = (props: Props) => {
  return (
    <ScaleCard id="overview" className="card">
      <h1>Overview</h1>
      <hr />
      <ProjectInfo project={props.project} />
      <hr />
      <Metrics project={props.project} />
    </ScaleCard>
  );
}

export default OverviewCard;