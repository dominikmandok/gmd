import { ChartOptions } from "chart.js";
import { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";

export const ZOOM_OPTIONS: ZoomPluginOptions = {
    zoom: {
        wheel: {
            enabled: true,
            modifierKey: 'shift'
        },
        drag: {
            enabled: true
        },
        mode: 'x'
    }
}

export const OPTIONS_LINE = (): ChartOptions<"line"> => {
    const options: ChartOptions<"line"> = {
        plugins: {
            zoom: {
                ...ZOOM_OPTIONS,
                limits: {
                    x: {
                        min: "original",
                        max: "original"
                    }
                }
            }
        },
        responsive: true,
    };

    return options;
}

export const OPTIONS_SCATTER = (labels: number[], commits: {date: number, hash: string}[], stacked?: boolean): ChartOptions<"scatter"> => {
    const options: ChartOptions<"scatter"> = {
        scales: {
            x: {
                ticks: {
                    callback: (value: any) => {
                        const date: Date = new Date(value);
                        return date.toLocaleDateString("de-DE");
                    }
                },
                min: labels[0] - 16*24*60*60*1000,
                max: labels[labels.length - 1] + 16*24*60*60*1000
            },
            y: {
                min: 0
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        let label: string = context.dataset.label || '';

                        if (label !== '') {
                            const date: Date = new Date(context.parsed.x);
                            const dateString = date.toLocaleString("de-DE").replace(",", "");

                            label = `${label}: (${dateString}, ${context.parsed.y})`;
                        }
                        
                        return label;
                    },
                    // removing title
                    title: (context: any) => { return "" }
                }
            },
            zoom: {...ZOOM_OPTIONS, limits: {x: {
                min: labels[0] - 16*24*60*60*1000,
                max: labels[labels.length - 1] + 16*24*60*60*1000
            }}}
        },
        onClick: (event: any, activeElements: any) => {
            if (activeElements.length > 0) {
                const timestamp = activeElements[0].element.$context.parsed.x;

                // get the hash of the commit that was made on the selected date
                const commit = commits.find(commit => commit.date === timestamp);
                const commitHash = commit ? commit.hash : "";
                
                if (commitHash.length > 0) {
                    // open commit in new tab
                    window.open(`https://gitlab.devops.telekom.de/dominik.mandok/gmd/-/commit/${commitHash}`, "_blank");
                }
            }
        },
        responsive: true,
    };

    if(stacked === true)
        return {...options, scales: {...options.scales, y: {...options.scales!.y, stacked: true}}};
    else
        return options;
}
