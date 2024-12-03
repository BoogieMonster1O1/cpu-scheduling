import type { Process, ScheduleResult, GanttChartEntry, ProcessResult } from "$lib";

export function scheduleSRTF(queue: Process[]): ScheduleResult {
    const sortedQueue = [...queue].map((process, index) => ({ ...process, originalIndex: index }));
    sortedQueue.sort((a, b) => {
        if (a.arrivalTime === b.arrivalTime) {
            return a.originalIndex - b.originalIndex;
        }
        return a.arrivalTime - b.arrivalTime;
    });

    const ganttChart: GanttChartEntry[] = [];
    const results: ProcessResult[] = [];
    let currentTime = 0;
    const remainingBurst = new Map<number, number>();
    const completed = new Set<number>();
    let lastProcess: Process | null = null;

    sortedQueue.forEach(process => remainingBurst.set(process.id, process.burstTime));

    while (completed.size < queue.length) {
        const readyQueue = sortedQueue.filter(
            p => p.arrivalTime <= currentTime && !completed.has(p.id)
        );

        if (readyQueue.length > 0) {
            readyQueue.sort((a, b) => {
                const burstA = remainingBurst.get(a.id)!;
                const burstB = remainingBurst.get(b.id)!;
                if (burstA === burstB) {
                    return a.originalIndex - b.originalIndex;
                }
                return burstA - burstB;
            });

            const currentProcess = readyQueue[0];

            if (lastProcess !== currentProcess) {
                if (lastProcess) {
                    ganttChart[ganttChart.length - 1].endTime = currentTime;
                }
                ganttChart.push({ process: currentProcess, startTime: currentTime, endTime: 0 });
                lastProcess = currentProcess;
            }

            remainingBurst.set(currentProcess.id, remainingBurst.get(currentProcess.id)! - 1);

            if (remainingBurst.get(currentProcess.id)! === 0) {
                completed.add(currentProcess.id);

                const turnaroundTime = currentTime + 1 - currentProcess.arrivalTime;
                const waitingTime = turnaroundTime - currentProcess.burstTime;

                results.push({
                    id: currentProcess.id,
                    burstTime: currentProcess.burstTime,
                    waitingTime,
                    turnaroundTime,
                });
            }
        } else {
            if (lastProcess) {
                ganttChart[ganttChart.length - 1].endTime = currentTime;
                lastProcess = null;
            }
        }

        currentTime++;
    }

    if (lastProcess) {
        ganttChart[ganttChart.length - 1].endTime = currentTime;
    }

    const averageWaitingTime =
        results.reduce((sum, p) => sum + p.waitingTime, 0) / results.length;
    const averageTurnaroundTime =
        results.reduce((sum, p) => sum + p.turnaroundTime, 0) / results.length;

    return { ganttChart, processes: results, averageWaitingTime, averageTurnaroundTime };
}
