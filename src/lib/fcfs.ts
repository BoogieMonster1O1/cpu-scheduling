import type { Process, ScheduleResult, GanttChartEntry, ProcessResult } from "$lib";

export function scheduleFCFS(queue: Process[]): ScheduleResult {
    const processes = [...queue].map((process, index) => ({ ...process, originalIndex: index }));

    processes.sort((a, b) => {
        if (a.arrivalTime === b.arrivalTime) {
            return a.originalIndex - b.originalIndex;
        }
        return a.arrivalTime - b.arrivalTime;
    });

    let currentTime = 0;
    const ganttChart: GanttChartEntry[] = [];
    const processResults: ProcessResult[] = [];
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;

    for (const process of processes) {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }

        const startTime = currentTime;
        const endTime = currentTime + process.burstTime;
        ganttChart.push({
            process,
            startTime,
            endTime,
        });

        const waitingTime = startTime - process.arrivalTime;
        const turnaroundTime = endTime - process.arrivalTime;

        totalWaitingTime += waitingTime;
        totalTurnaroundTime += turnaroundTime;

        processResults.push({
            id: process.id,
            waitingTime,
            turnaroundTime,
            burstTime: process.burstTime,
        });

        currentTime = endTime;
    }

    const averageWaitingTime = totalWaitingTime / processes.length;
    const averageTurnaroundTime = totalTurnaroundTime / processes.length;

    return {
        ganttChart,
        processes: processResults,
        averageWaitingTime,
        averageTurnaroundTime,
    };
}
