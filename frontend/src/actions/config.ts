
export module Config {
    export class Repository {
        static readonly DEFAULT_BRANCH: string = 'main';
    }

    export class Drawer {
        static readonly METRIC_BASE_CONFIG = [
            {
                borderColor: 'rgba(0, 230, 190, 0.75)',
                backgroundColor: 'rgba(0, 230, 190, 0.5)',
                fill: 'origin',
                tension: 0.15
            },
            {
                borderColor: 'rgba(247, 91, 208, 0.75)',
                backgroundColor: 'rgba(247, 91, 208, 0.5)',
                fill: 'origin',
                tension: 0.15
            }
        ];

        static readonly languageColors = new Map([
            ["Python", "rgba(55, 120, 174, 0.3)"],
            ["JavaScript", "rgba(255, 204, 0, 0.3)"],
            ["TypeScript", "rgba(0, 122, 204, 0.3)"],
            ["HTML", "rgba(229, 77, 38, 0.3)"],
            ["CSS", "rgba(38, 78, 228, 0.3)"],
            ["Dockerfile", "rgba(36, 184, 235, 0.3)"],
            ["JSON", "rgba(50, 205, 50, 0.3)"]
        ]);
    }
}