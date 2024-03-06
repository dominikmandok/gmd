import { Project } from "../../actions/api/gitlabapi";
import LoadingSpinner from "../misc/LoadingSpinner";

interface Props {
  project: Project | null
}

const ProjectInfoCard = (props: Props) => {
  if (props.project === null) {
    return (
      <div id='pInfos'>
        <LoadingSpinner />
      </div>
    );
  }

  return(
    <div id='pInfos'>
      <h2>{props.project.name}</h2>
      <p>Project ID: {props.project.id}</p>
      <p>{props.project.description}</p>
    </div>
  );
}

export default ProjectInfoCard;