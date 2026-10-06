<script setup lang="ts">
// Ready for routing controls
</script>

<template>
  <div
    class="min-h-screen w-full bg-zinc-950 text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">

    <!-- Warm Ambient Glow Effect Background -->
    <div
      class="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none">
    </div>
    <div
      class="absolute -bottom-40 left-1/3 w-[300px] h-[300px] bg-zinc-500/5 rounded-full blur-[100px] pointer-events-none">
    </div>

    <!-- Header / Branding Section -->
    <header class="w-full flex flex-col items-center pt-12 md:pt-16 pb-8 text-center z-10">
      <h1
        class="text-6xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-sm select-none">
        karnay
      </h1>
      <p
        class="text-zinc-400 text-xs font-semibold tracking-widest uppercase mt-3 bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800">
        Mom's Shop Dashboard
      </p>
    </header>

    <!-- Main Navigation Grid -->
    <main class="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 h-full my-auto py-8 z-10">

      <!-- Card 1: Items & Stock -->
      <NuxtLink to="/addpage"
        class="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-8 flex flex-col justify-between items-start transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/70 hover:-translate-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md min-h-[220px]">
        <div
          class="w-12 h-12 bg-zinc-800 border border-zinc-700/50 text-zinc-300 rounded-2xl flex items-center justify-center group-hover:text-white group-hover:scale-110 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21 16-4 4-4-4" />
            <path d="M17 20V4" />
            <path d="M3 4h5v5H3z" />
            <path d="M3 11h5v5H3z" />
            <path d="M3 18h5v5H3z" />
          </svg>
        </div>
        <div class="mt-8">
          <h2 class="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
            Items & Stock
          </h2>
          <p class="text-zinc-400 text-sm mt-1 font-normal group-hover:text-zinc-300 transition-colors">
            Add new products, change prices, or update item quantities on your shelves.
          </p>
        </div>
      </NuxtLink>

      <!-- Card 2: Sell Items (Checkout) -->
      <NuxtLink to="/checkout"
        class="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-8 flex flex-col justify-between items-start transition-all duration-300 hover:border-amber-500/40 hover:bg-zinc-900/70 hover:-translate-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md min-h-[220px]">
        <div
          class="w-12 h-12 bg-zinc-800 border border-zinc-700/50 text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/10 group-hover:scale-110 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>
        <div class="mt-8">
          <h2 class="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-amber-400 transition-colors">
            Sell Items
          </h2>
          <p class="text-zinc-400 text-sm mt-1 font-normal group-hover:text-zinc-300 transition-colors">
            Open the register to ring up a customer order and record the sale.
          </p>
        </div>
      </NuxtLink>

      <!-- Card 3: Shop Sales & Reports (Analysis) -->
      <NuxtLink to="/reports"
        class="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-8 flex flex-col justify-between items-start transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/70 hover:-translate-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md min-h-[220px]">
        <div
          class="w-12 h-12 bg-zinc-800 border border-zinc-700/50 text-zinc-300 rounded-2xl flex items-center justify-center group-hover:text-white group-hover:scale-110 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" x2="18" y1="20" y2="10" />
            <line x1="12" x2="12" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="14" />
          </svg>
        </div>
        <div class="mt-8">
          <h2 class="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
            Shop Sales & Reports
          </h2>
          <p class="text-zinc-400 text-sm mt-1 font-normal group-hover:text-zinc-300 transition-colors">
            See how much the shop made, view total values, and review past sales history.
          </p>
        </div>
      </NuxtLink>

    </main>

    <!-- Footer Signature -->
    <footer class="w-full flex justify-center py-6 text-zinc-600 text-xs font-mono tracking-wider z-10 select-none">
      MADE WITH ♥ FOR MOM
    </footer>
  </div>
</template>

<style scoped>
.group {
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>
