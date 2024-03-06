import { ScaleAppShell } from '@telekom/scale-components-react';
import React from 'react';
import { Project } from './actions/api/gitlabapi';
import { Project as ProjectGQL } from './actions/api/gitlab.graphql.types';
import HistorySection from './components/HistorySection';
import OverviewCard from './components/OverviewCard';
import './App.css';
import { checkToken, getProjectData } from './actions/App';
import { getProjectFromGraphQL } from './actions/api/graphqlapi';

const PROJECT_ID = '125633';

interface State {
  project: Project | null,
  projectGQL: ProjectGQL | null,
}

class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      project: null,
      projectGQL: null,
    };
  }

  async componentDidMount() {
    const gitlabCookieName: string = "project_access_token";
    const gitlabToken: string = checkToken(gitlabCookieName);
    const projectInfo: Project = await getProjectData(PROJECT_ID, gitlabToken);
    this.setState({ project: projectInfo});
    
    const projectInfoGQL = await getProjectFromGraphQL(gitlabToken);
    this.setState({ projectGQL: projectInfoGQL });
  }

  render() {
    return (
      <div className="App">
        <ScaleAppShell claimLang='de' portalName='GMD - Git Metrics Dashboard'>
          <div id="main" className='flex-row wrap gap'>
            <OverviewCard project={this.state.project} />
            <HistorySection project={this.state.projectGQL} />
          </div>
        </ScaleAppShell>
      </div>
    );
  }
}


export default App;
