import { ScaleCard } from "@telekom/scale-components-react";
import { ChartData, ChartOptions, Point } from "chart.js";
import { Line, Scatter } from "react-chartjs-2";

interface LineProps {
  title: string
  className?: string
  graphData: ChartData<"line", (number | Point | null)[], unknown>
  graphOptions: ChartOptions<"line">
}

const LineGraphCard = (props: LineProps) => {
  return (
    <ScaleCard className={props.className ?? ""}>
      <h2>{props.title}</h2>
      <div>
      <Line data={props.graphData} options={props.graphOptions} />
      </div>
    </ScaleCard>
  );
}

interface ScatterProps {
  title: string
  className?: string
  graphData: ChartData<"scatter", (number | Point | null)[], unknown>
  graphOptions: ChartOptions<"scatter">
}

const ScatterGraphCard = (props: ScatterProps) => {
  return (
    <ScaleCard className={props.className ?? ""}>
      <h2>{props.title}</h2>
      <div>
      <Scatter data={props.graphData} options={props.graphOptions} />
      </div>
    </ScaleCard>
  );
}

export { LineGraphCard, ScatterGraphCard };
