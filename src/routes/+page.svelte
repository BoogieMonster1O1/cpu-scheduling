<script lang="ts">
    import type { Process } from "$lib";

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
            alert("Priority is required for priority based scheduling.");
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
</script>

<div
    class="flex flex-col min-h-screen items-center justify-center text-neutral-100"
>
    <h1
        class="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500"
    >
        CPU Scheduler
    </h1>

    <!-- Form Section Above Table -->
    <form
        class="flex flex-col items-center justify-center w-full max-w-3xl p-4 bg-neutral-800 rounded-lg shadow-lg mb-6"
    >
        <!-- Priority Checkbox -->
        <div class="flex items-center justify-start w-full mb-4">
            <input
                type="checkbox"
                bind:checked={isPriorityBased}
                id="priority-based"
                class="mr-2"
            />
            <label for="priority-based">Priority Based</label>
        </div>

        <!-- Process Input Fields -->
        <div class="grid grid-cols-2 gap-4 w-full mb-4">
            <div class="flex flex-col">
                <label for="process-id" class="text-neutral-100"
                    >Process ID</label
                >
                <input
                    type="number"
                    placeholder="Process ID"
                    bind:value={inputProcess.id}
                    class="border border-neutral-700 bg-neutral-800 text-neutral-100 p-2 rounded"
                />
            </div>
            <div class="flex flex-col">
                <label for="arrival-time" class="text-neutral-100"
                    >Arrival Time</label
                >
                <input
                    type="number"
                    placeholder="Arrival Time"
                    bind:value={inputProcess.arrivalTime}
                    class="border border-neutral-700 bg-neutral-800 text-neutral-100 p-2 rounded"
                />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4 w-full mb-4">
            <div class="flex flex-col">
                <label for="burst-time" class="text-neutral-100"
                    >Burst Time</label
                >
                <input
                    type="number"
                    placeholder="Burst Time"
                    bind:value={inputProcess.burstTime}
                    class="border border-neutral-700 bg-neutral-800 text-neutral-100 p-2 rounded"
                />
            </div>
            {#if isPriorityBased}
                <div class="flex flex-col">
                    <label for="priority" class="text-neutral-100"
                        >Priority</label
                    >
                    <input
                        type="number"
                        placeholder="Priority"
                        bind:value={inputProcess.priority}
                        class="border border-neutral-700 bg-neutral-800 text-neutral-100 p-2 rounded"
                    />
                </div>
            {/if}
        </div>

        <div class="flex items-center justify-between w-full mb-4">
            <button
                type="button"
                on:click={addProcess}
                class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-neutral-100"
            >
                Add Process
            </button>

            <div class="flex items-center space-x-2">
                <label for="time-quantum" class="text-neutral-100"
                    >Time Quantum</label
                >
                <input
                    type="number"
                    placeholder="Time Quantum"
                    bind:value={timeQuantum}
                    class="border border-neutral-700 bg-neutral-800 text-neutral-100 p-2 rounded"
                />
            </div>
        </div>
    </form>

    <!-- Process Table -->
    <table class="border-collapse w-full max-w-2xl bg-neutral-800 rounded-lg">
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
                    class="hover:bg-neutral-700"
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
                        class="border border-neutral-700 px-4 py-2 flex space-x-2"
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
