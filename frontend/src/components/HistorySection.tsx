import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Colors, ChartData, ChartOptions } from 'chart.js';
import { getAllChartData } from "../actions/historyChartDrawer";
import { Project as ProjectGQL } from "../actions/api/gitlab.graphql.types";
import LoadingSpinner from "./misc/LoadingSpinner";
import zoomPlugin from 'chartjs-plugin-zoom';
import { LineGraphCard, ScatterGraphCard } from "./GraphCard";

interface Props {
  project: ProjectGQL | null
}

interface State {
  metrics: {data: ChartData<"line">, options: ChartOptions<"line">} | null
  langPerc: {data: ChartData<"scatter">, options: ChartOptions<"scatter">} | null
  langAbs: {data: ChartData<"scatter">, options: ChartOptions<"scatter">} | null
  sast: {data: ChartData<"scatter">, options: ChartOptions<"scatter">} | null
  cq: {data: ChartData<"scatter">, options: ChartOptions<"scatter">} | null
  alreadyDrawn: boolean
}

class HistorySection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Colors, zoomPlugin);

    this.state = {
      metrics: null,
      langPerc: null,
      langAbs: null,
      sast: null,
      cq: null,
      alreadyDrawn: false
    };
  }

  async componentDidUpdate() {
    if (this.props.project !== null && ! this.state.alreadyDrawn) {
      const { metricData, langPercData, langAbsData, sastData, cqData} = await getAllChartData(this.props.project!);

      this.setState({
        metrics: metricData,
        langPerc: langPercData,
        langAbs: langAbsData,
        sast: sastData,
        cq: cqData,
        alreadyDrawn: true
      });
    }
  }

  render() {
    if (this.state.cq !== null && this.state.langAbs !== null && this.state.langPerc !== null && this.state.metrics !== null && this.state.sast !== null) {
      return (
        <>
          <LineGraphCard className="graph-card" title="Metrics" graphData={this.state.metrics.data} graphOptions={this.state.metrics.options} />
          <ScatterGraphCard className="graph-card" title="Language Percentage" graphData={this.state.langPerc.data} graphOptions={this.state.langPerc.options} />
          <ScatterGraphCard className="graph-card" title="Language Absolute" graphData={this.state.langAbs.data} graphOptions={this.state.langAbs.options} />
          <ScatterGraphCard className="graph-card" title="SAST" graphData={this.state.sast.data} graphOptions={this.state.sast.options} />
          <ScatterGraphCard className="graph-card" title="Code Quality" graphData={this.state.cq.data} graphOptions={this.state.cq.options} />
        </>
      );
    }

    return (
      <>
        <LoadingSpinner />
      </>
    );
  }
}

export default HistorySection;