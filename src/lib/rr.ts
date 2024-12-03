import type { Process, ScheduleResult, GanttChartEntry, ProcessResult } from "$lib";

export function scheduleRoundRobin(queue: Process[], quantum: number): ScheduleResult {
    const ganttChart: GanttChartEntry[] = [];
    const results: ProcessResult[] = [];
    let currentTime = 0;
    const remainingBurst = new Map<number, number>();
    const completed = new Set<number>();
    let lastProcess: Process | null = null;

    queue.forEach(process => remainingBurst.set(process.id, process.burstTime));

    const sortedQueue = [...queue].map((process, index) => ({ ...process, originalIndex: index }));
    sortedQueue.sort((a, b) => {
        if (a.arrivalTime === b.arrivalTime) {
            return a.originalIndex - b.originalIndex;
        }
        return a.arrivalTime - b.arrivalTime;
    });

    const readyQueue: Process[] = [];
    let i = 0;
    while (completed.size < queue.length || readyQueue.length > 0) {
        while (i < sortedQueue.length && sortedQueue[i].arrivalTime <= currentTime) {
            readyQueue.push(sortedQueue[i]);
            i++;
        }

        if (readyQueue.length > 0) {
            const currentProcess = readyQueue.shift()!;

            const remainingTime = remainingBurst.get(currentProcess.id)!;
            const timeToRun = Math.min(remainingTime, quantum);
            currentTime += timeToRun;
            remainingBurst.set(currentProcess.id, remainingTime - timeToRun);

            if (lastProcess !== currentProcess) {
                if (lastProcess) {
                    if (currentTime !== currentTime - timeToRun) {
                        ganttChart.push({
                            process: lastProcess,
                            startTime: currentTime - timeToRun,
                            endTime: currentTime - timeToRun,
                        });
                    }
                }
                lastProcess = currentProcess;
            }

            ganttChart.push({
                process: currentProcess,
                startTime: currentTime - timeToRun,
                endTime: currentTime,
            });

            if (remainingBurst.get(currentProcess.id) === 0) {
                completed.add(currentProcess.id);
                results.push({
                    id: currentProcess.id,
                    waitingTime: currentTime - currentProcess.arrivalTime - currentProcess.burstTime,
                    turnaroundTime: currentTime - currentProcess.arrivalTime,
                    burstTime: currentProcess.burstTime,
                });
            } else {
                readyQueue.push(currentProcess);
            }
        } else {
            currentTime++;
        }
    }

    const totalWaitingTime = results.reduce((sum, result) => sum + result.waitingTime, 0);
    const totalTurnaroundTime = results.reduce((sum, result) => sum + result.turnaroundTime, 0);

    // remove entries in the gantt chart that have the same start and end time
    for (let i = 0; i < ganttChart.length; i++) {
        if (ganttChart[i].startTime === ganttChart[i].endTime) {
            ganttChart.splice(i, 1);
            i--;
        }
    }

    return {
        ganttChart,
        processes: results,
        averageWaitingTime: totalWaitingTime / results.length,
        averageTurnaroundTime: totalTurnaroundTime / results.length,
    };
}
