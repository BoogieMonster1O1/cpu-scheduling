<script lang="ts">
    import type { ScheduleResult } from "$lib";
    import { quintOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import GanttChart from "./GanttChart.svelte";

    export let result: ScheduleResult;

    let isModalOpen = false;

    function openModal() {
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
    }
</script>

<div
    class="flex flex-col items-center justify-center text-neutral-100 space-y-8"
>
    <!-- Process Details Table -->
    <div class="w-full max-w-4xl">
        <h2 class="text-2xl font-bold mb-4">Process Details</h2>
        <table class="border-collapse w-full">
            <thead>
                <tr>
                    <th
                        class="border border-neutral-700 bg-neutral-800 px-4 py-2"
                        >Process ID</th
                    >
                    <th
                        class="border border-neutral-700 bg-neutral-800 px-4 py-2"
                        >Burst Time</th
                    >
                    <th
                        class="border border-neutral-700 bg-neutral-800 px-4 py-2"
                        >Waiting Time</th
                    >
                    <th
                        class="border border-neutral-700 bg-neutral-800 px-4 py-2"
                        >Turnaround Time</th
                    >
                </tr>
            </thead>
            <tbody>
                {#each result.processes as process, index}
                    <tr class="hover:bg-neutral-700">
                        <td class="border border-neutral-700 px-4 py-2"
                            >{process.id}</td
                        >
                        <td class="border border-neutral-700 px-4 py-2"
                            >{process.burstTime}</td
                        >
                        <td class="border border-neutral-700 px-4 py-2"
                            >{process.waitingTime}</td
                        >
                        <td class="border border-neutral-700 px-4 py-2"
                            >{process.turnaroundTime}</td
                        >
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Gantt Chart -->
    <div class="w-full max-w-4xl">
        <h2 class="text-2xl font-bold mb-4">Gantt Chart</h2>
        <GanttChart ganttChart={result.ganttChart} />
        <button
            class="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            on:click={openModal}
        >
            Expand Gantt Chart
        </button>
    </div>

    <!-- Summary Section -->
    <div class="w-full max-w-4xl">
        <h2 class="text-2xl font-bold mb-4">Summary</h2>
        <div class="flex justify-between text-lg">
            <p>
                <strong>Average Waiting Time:</strong>
                {result.averageWaitingTime.toFixed(2)}
            </p>
            <p>
                <strong>Average Turnaround Time:</strong>
                {result.averageTurnaroundTime.toFixed(2)}
            </p>
        </div>
    </div>
</div>

{#if isModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center transition">
        <button
            transition:fade={{ duration: 150 }}
            on:click={() => (isModalOpen = false)}
            class="cursor-default absolute inset-0 bg-black opacity-50"
            aria-label="Close modal"
        ></button>
        <div
            transition:fly={{
                delay: 0,
                duration: 200,
                x: 0,
                y: 500,
                easing: quintOut,
            }}
            class="relative bg-white dark:bg-neutral-800 rounded-lg p-8 max-w-screen-lg flex w-full flex-row"
        >
            <div class="flex-1">
                <button
                    class="absolute top-0 right-0 p-2 hover:text-neutral-600 transition"
                    on:click={closeModal}
                    aria-label="Close modal"
                >
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>

                <h2 class="text-2xl font-bold mb-4 text-white">Gantt Chart</h2>
                <GanttChart ganttChart={result.ganttChart} />
            </div>
        </div>
    </div>
{/if}
