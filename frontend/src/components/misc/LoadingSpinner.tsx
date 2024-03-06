import { ScaleLoadingSpinner } from "@telekom/scale-components-react";

interface Props {
  text?: string
}

const LoadingSpinner = (props: Props) => {
  return (
    <ScaleLoadingSpinner text={props.text === undefined ? "Loading..." : props.text} />
  );
}

export default LoadingSpinner;