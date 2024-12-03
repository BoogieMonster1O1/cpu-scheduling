import type { Process, ScheduleResult, GanttChartEntry, ProcessResult } from "$lib";

export function scheduleNonPreemptiveSJF(queue: Process[]): ScheduleResult {
    let sortedQueue = [...queue].map((process, index) => ({ ...process, originalIndex: index }));
    sortedQueue.sort((a, b) => {
        if (a.arrivalTime === b.arrivalTime) {
            return a.originalIndex - b.originalIndex;
        }
        return a.arrivalTime - b.arrivalTime;
    });

    const ganttChart: GanttChartEntry[] = [];
    const results: ProcessResult[] = [];
    let currentTime = 0;
    let waitingQueue: typeof sortedQueue = [];

    while (sortedQueue.length > 0 || waitingQueue.length > 0) {
        waitingQueue.push(...sortedQueue.filter(p => p.arrivalTime <= currentTime));
        sortedQueue = sortedQueue.filter(p => p.arrivalTime > currentTime);

        if (waitingQueue.length > 0) {
            waitingQueue.sort((a, b) => {
                if (a.burstTime === b.burstTime) {
                    return a.originalIndex - b.originalIndex;
                }
                return a.burstTime - b.burstTime;
            });

            const currentProcess = waitingQueue.shift()!;
            const startTime = currentTime;
            const endTime = startTime + currentProcess.burstTime;

            ganttChart.push({ process: currentProcess, startTime, endTime });

            results.push({
                id: currentProcess.id,
                burstTime: currentProcess.burstTime,
                waitingTime: startTime - currentProcess.arrivalTime,
                turnaroundTime: endTime - currentProcess.arrivalTime,
            });

            currentTime = endTime;
        } else {
            currentTime++;
        }
    }

    const averageWaitingTime =
        results.reduce((sum, p) => sum + p.waitingTime, 0) / results.length;
    const averageTurnaroundTime =
        results.reduce((sum, p) => sum + p.turnaroundTime, 0) / results.length;

    return { ganttChart, processes: results, averageWaitingTime, averageTurnaroundTime };
}
