<script lang="ts">
    import type { Process, ScheduleResult } from "$lib";
    import { scheduleFCFS } from "$lib/fcfs";
    import ResultTable from "$lib/ResultTable.svelte";
    import { scheduleRoundRobin } from "$lib/rr";
    import { scheduleNonPreemptiveSJF } from "$lib/sjf";
    import { scheduleSRTF } from "$lib/srtf";

    let processes: Process[] = [];
    let timeQuantum: number = 0;
    let inputProcess: Process = {
        id: 1,
        arrivalTime: 0,
        burstTime: 0,
        priority: 1,
    };
    let isPriorityBased: boolean = false;

    function deleteProcess(index: number) {
        processes = processes.filter((_, i) => i !== index);
    }

    function moveRow(index: number, direction: number) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= processes.length) return;

        const reordered = [...processes];
        [reordered[index], reordered[newIndex]] = [
            reordered[newIndex],
            reordered[index],
        ];
        processes = reordered;
    }

    function handleDragStart(e: DragEvent, index: number) {
        e.dataTransfer?.setData("text/plain", index.toString());
    }

    function handleDrop(e: DragEvent, index: number) {
        e.preventDefault();
        const draggedIndex = parseInt(
            e.dataTransfer?.getData("text/plain") || "0",
        );
        const reordered = [...processes];
        const [draggedRow] = reordered.splice(draggedIndex, 1);
        reordered.splice(index, 0, draggedRow);
        processes = reordered;
    }

    function allowDrop(e: DragEvent) {
        e.preventDefault();
    }

    function addProcess() {
        if (isPriorityBased && inputProcess.priority === 0) {
            alert("Priority is required for priority-based scheduling.");
            return;
        }
        if (processes.find((p) => p.id === inputProcess.id)) {
            alert("Process ID already exists.");
            return;
        }
        if (inputProcess.burstTime === 0) {
            alert("Burst Time cannot be zero.");
            return;
        }
        if (inputProcess.burstTime < 0) {
            alert("Burst Time cannot be negative.");
            return;
        }
        if (inputProcess.arrivalTime < 0) {
            alert("Arrival Time cannot be negative.");
            return;
        }
        processes = [...processes, { ...inputProcess }];
        inputProcess = {
            id: inputProcess.id + 1,
            arrivalTime: 0,
            burstTime: 0,
            priority: 1,
        };
    }

    let result: ScheduleResult | null = null;
</script>

<div
    class="flex flex-col lg:flex-row lg:items-start lg:space-x-6 min-h-screen p-4 bg-neutral-900 text-neutral-100"
>
    <!-- Input Form -->
    <div class="flex-grow lg:basis-2/3 p-4 bg-neutral-800 rounded-lg shadow-lg">
        <h1
            class="text-3xl lg:text-5xl mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500"
        >
            CPU Scheduler
        </h1>

        <form class="space-y-4">
            <div class="flex items-center mb-4">
                <input
                    type="checkbox"
                    bind:checked={isPriorityBased}
                    id="priority-based"
                    class="mr-2"
                />
                <label for="priority-based">Priority Based</label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="process-id" class="block mb-1">Process ID</label
                    >
                    <input
                        type="number"
                        bind:value={inputProcess.id}
                        class="w-full p-2 border border-neutral-700 bg-neutral-900 rounded"
                    />
                </div>
                <div>
                    <label for="arrival-time" class="block mb-1"
                        >Arrival Time</label
                    >
                    <input
                        type="number"
                        bind:value={inputProcess.arrivalTime}
                        class="w-full p-2 border border-neutral-700 bg-neutral-900 rounded"
                    />
                </div>
                <div>
                    <label for="burst-time" class="block mb-1">Burst Time</label
                    >
                    <input
                        type="number"
                        bind:value={inputProcess.burstTime}
                        class="w-full p-2 border border-neutral-700 bg-neutral-900 rounded"
                    />
                </div>
                {#if isPriorityBased}
                    <div>
                        <label for="priority" class="block mb-1">Priority</label
                        >
                        <input
                            type="number"
                            bind:value={inputProcess.priority}
                            class="w-full p-2 border border-neutral-700 bg-neutral-900 rounded"
                        />
                    </div>
                {/if}
            </div>

            <div class="flex justify-between">
                <button
                    type="button"
                    on:click={addProcess}
                    class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
                >
                    Add Process
                </button>
                <div class="flex items-center space-x-2">
                    <label for="time-quantum">Time Quantum</label>
                    <input
                        type="number"
                        bind:value={timeQuantum}
                        class="w-20 p-2 border border-neutral-700 bg-neutral-900 rounded"
                    />
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button
                    type="button"
                    class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                    on:click={() => {
                        result = scheduleFCFS(processes);
                    }}
                >
                    FCFS
                </button>
                <button
                    type="button"
                    class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                    on:click={() => {
                        result = scheduleNonPreemptiveSJF(processes);
                    }}
                >
                    SJF
                </button>
                <button
                    type="button"
                    class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                    on:click={() => {
                        result = scheduleSRTF(processes);
                    }}
                >
                    SRTF
                </button>
                <button
                    type="button"
                    class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                    on:click={() => {
                        if (timeQuantum === 0) {
                            alert("Time Quantum is required for Round Robin.");
                            return;
                        }
                        result = scheduleRoundRobin(processes, timeQuantum);
                    }}
                >
                    Round Robin
                </button>
            </div>
        </form>

        <div class="w-full flex justify-between pt-4">
            <table
                class="border-collapse w-full bg-neutral-800 rounded-lg"
            >
                <thead>
                    <tr>
                        <th
                            class="border border-neutral-700 bg-neutral-700 px-4 py-2 text-neutral-100"
                            >Process ID</th
                        >
                        <th
                            class="border border-neutral-700 bg-neutral-700 px-4 py-2 text-neutral-100"
                            >Arrival Time</th
                        >
                        <th
                            class="border border-neutral-700 bg-neutral-700 px-4 py-2 text-neutral-100"
                            >Burst Time</th
                        >
                        {#if isPriorityBased}
                            <th
                                class="border border-neutral-700 bg-neutral-700 px-4 py-2 text-neutral-100"
                                >Priority</th
                            >
                        {/if}
                        <th
                            class="border border-neutral-700 bg-neutral-700 px-4 py-2 text-neutral-100"
                            >Actions</th
                        >
                    </tr>
                </thead>
                <tbody>
                    {#each processes as process, i}
                        <tr
                            draggable="true"
                            on:dragstart={(e) => handleDragStart(e, i)}
                            on:drop={(e) => handleDrop(e, i)}
                            on:dragover={allowDrop}
                        >
                            <td
                                class="border border-neutral-700 px-4 py-2 text-neutral-100"
                                >{process.id}</td
                            >
                            <td
                                class="border border-neutral-700 px-4 py-2 text-neutral-100"
                                >{process.arrivalTime}</td
                            >
                            <td
                                class="border border-neutral-700 px-4 py-2 text-neutral-100"
                                >{process.burstTime}</td
                            >
                            {#if isPriorityBased}
                                <td
                                    class="border border-neutral-700 px-4 py-2 text-neutral-100"
                                    >{process.priority}</td
                                >
                            {/if}
                            <td
                                class="border border-neutral-700 px-4 py-2 flex justify-evenly space-x-2"
                            >
                                <button
                                    type="button"
                                    on:click={() => moveRow(i, -1)}
                                    class="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    on:click={() => moveRow(i, 1)}
                                    class="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    on:click={() => deleteProcess(i)}
                                    class="bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                                >
                                    X
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Results -->
    <div class="flex-grow lg:basis-1/3 p-4 bg-neutral-800 rounded-lg shadow-lg">
        {#if result}
            <ResultTable {result} />
        {:else}
            <p class="text-center text-neutral-400">
                No results yet. Schedule a process to see the results here.
            </p>
        {/if}
    </div>
</div>
