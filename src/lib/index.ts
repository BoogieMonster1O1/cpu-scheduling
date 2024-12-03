// place files you want to import through the `$lib` alias in this folder.

export interface Process {
    id: number;
    priority: number;
    burstTime: number;
    arrivalTime: number;
}

export interface GanttChartEntry {
    process: Process;
    startTime: number;
    endTime: number;
}

export interface ProcessResult {
    waitingTime: number;
    turnaroundTime: number;
    burstTime: number;
}

export interface ScheduleResult {
    ganttChart: GanttChartEntry[];
    processes: ProcessResult[];
    averageWaitingTime: number;
    averageTurnaroundTime: number;
}
