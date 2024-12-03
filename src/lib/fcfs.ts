import type { Process, ScheduleResult } from "$lib";

export function scheduleFCFS(queue: Process[]): ScheduleResult {
    const ganttChart = [];
    const processes = [];
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;

    for (const process of queue) {
        const startTime = Math.max(currentTime, process.arrivalTime);
        const endTime = startTime + process.burstTime;
        const waitingTime = startTime - process.arrivalTime;
        const turnaroundTime = waitingTime + process.burstTime;

        ganttChart.push({
            process,
            startTime,
            endTime,
        });

        processes.push({
            waitingTime,
            turnaroundTime,
            burstTime: process.burstTime,
        });

        currentTime = endTime;
        totalWaitingTime += waitingTime;
        totalTurnaroundTime += turnaroundTime;
    }

    const averageWaitingTime = totalWaitingTime / queue.length;
    const averageTurnaroundTime = totalTurnaroundTime / queue.length;

    return {
        ganttChart,
        processes,
        averageWaitingTime,
        averageTurnaroundTime,
    };
}
