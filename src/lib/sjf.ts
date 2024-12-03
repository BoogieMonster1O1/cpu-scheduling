import type { Process, ScheduleResult } from "$lib";

export function scheduleNonPreemptiveSJF(queue: Process[]): ScheduleResult {
    const ganttChart = [];
    const processes = [];
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;

    queue.sort((a, b) => a.burstTime - b.burstTime);

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

export function schedulePreemptiveSJF(queue: Process[]): ScheduleResult {
    const ganttChart = [];
    const processes = [];
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;

    queue.sort((a, b) => a.arrivalTime - b.arrivalTime);

    const remainingQueue = [...queue];
    const readyQueue: Process[] = [];

    while (remainingQueue.length > 0 || readyQueue.length > 0) {
        if (readyQueue.length === 0) {
            const nextProcess = remainingQueue.shift()!;
            const startTime = Math.max(currentTime, nextProcess.arrivalTime);
            const endTime = startTime + nextProcess.burstTime;
            const waitingTime = startTime - nextProcess.arrivalTime;
            const turnaroundTime = waitingTime + nextProcess.burstTime;

            ganttChart.push({
                process: nextProcess,
                startTime,
                endTime,
            });

            processes.push({
                waitingTime,
                turnaroundTime,
                burstTime: nextProcess.burstTime,
            });

            currentTime = endTime;
            totalWaitingTime += waitingTime;
            totalTurnaroundTime += turnaroundTime;
        } else {
            readyQueue.sort((a, b) => a.burstTime - b.burstTime);
            const nextProcess = readyQueue.shift()!;
            const startTime = currentTime;
            const endTime = startTime + 1;
            const waitingTime = startTime - nextProcess.arrivalTime;
            const turnaroundTime = waitingTime + nextProcess.burstTime;

            ganttChart.push({
                process: nextProcess,
                startTime,
                endTime,
            });

            processes.push({
                waitingTime,
                turnaroundTime,
                burstTime: nextProcess.burstTime,
            });

            nextProcess.burstTime -= 1;
            currentTime = endTime;
            totalWaitingTime += waitingTime;
            totalTurnaroundTime += turnaroundTime;

            if (nextProcess.burstTime > 0) {
                readyQueue.push(nextProcess);
            }
        }

        while (remainingQueue.length > 0 && remainingQueue[0].arrivalTime <= currentTime) {
            readyQueue.push(remainingQueue.shift()!);
        }
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
