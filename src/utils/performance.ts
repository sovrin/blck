type BenchmarkResult = {
    milliseconds: number,
    ms: number,
    seconds: number,
    minutes: number,
}

type BenchmarkFunction = (callback: (start: number, end: number, result: BenchmarkResult) => void) => void;

export const benchmark = (method: (benchmark: BenchmarkFunction) => void) => {
    const start = +(new Date);

    method && method(function (benchmark: (start: number, end: number, result: BenchmarkResult) => void) {
        const end = +(new Date);
        const difference = end - start;

        benchmark && benchmark(start, end, {
            milliseconds: difference,
            ms: difference,
            seconds: (difference / 1000) % 60,
            minutes: (difference / (1000 * 60)) % 60,
        });
    });
};
