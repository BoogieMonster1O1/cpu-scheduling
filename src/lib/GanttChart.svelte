<script lang="ts">
    import type { GanttChartEntry } from "$lib";

    export let ganttChart: GanttChartEntry[];

    const colors = 7;
</script>

<div class="flex items-center border border-neutral-700 overflow-x-auto min-w-screen-sm">
    {#each ganttChart as entry, index}
        <div
            class="flex flex-col items-center justify-center px-4 py-2 text-white border-r border-neutral-700"
            class:bg-blue-500={entry.process.id % colors === 1}
            class:bg-red-500={entry.process.id % colors === 2}
            class:bg-green-500={entry.process.id % colors === 3}
            class:bg-yellow-500={entry.process.id % colors === 4}
            class:bg-purple-500={entry.process.id % colors === 5}
            class:bg-pink-500={entry.process.id % colors === 6}
            class:bg-teal-500={entry.process.id % colors === 0}
            style="flex: {entry.endTime - entry.startTime}"
        >
            <span class="text-xl">{entry.process.id}</span>
            <span class="text-xs">{entry.startTime} - {entry.endTime}</span>
        </div>
    {/each}
</div>
