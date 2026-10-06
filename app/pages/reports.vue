<script setup lang="ts">
import { ref, computed } from 'vue'

const { items, salesHistory } = useInventory()
const activeTimeframe = ref<'day' | 'week' | 'month'>('day')

const reportMetrics = computed(() => {
  const allSales = salesHistory.value || []
  const now = new Date()

  // 1. Filter Sales History by chosen block window
  const filteredSales = allSales.filter(sale => {
    const saleDate = new Date(sale.date)
    if (activeTimeframe.value === 'day') {
      const oneDayAgo = new Date()
      oneDayAgo.setHours(now.getHours() - 24)
      return saleDate >= oneDayAgo
    } else if (activeTimeframe.value === 'week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      return saleDate >= oneWeekAgo
    } else {
      const oneMonthAgo = new Date()
      oneMonthAgo.setDate(now.getDate() - 30)
      return saleDate >= oneMonthAgo
    }
  })

  let totalRevenue = 0
  let totalProfit = 0
  let totalSalesCount = 0
  const itemSalesMap = new Map()

  // Process item sales aggregates inside the period
  filteredSales.forEach(sale => {
    totalSalesCount += sale.items.reduce((sum: number, i: any) => sum + i.quantity, 0)
    totalRevenue += sale.total || 0

    if (typeof sale.profit === 'number') {
      totalProfit += sale.profit
    } else {
      let saleCost = 0
      sale.items.forEach((si: any) => {
        saleCost += (si.buyingPrice || si.price * 0.7) * si.quantity
      })
      totalProfit += (sale.total - saleCost)
    }

    sale.items.forEach(soldItem => {
      if (!itemSalesMap.has(soldItem.id)) {
        itemSalesMap.set(soldItem.id, {
          id: soldItem.id,
          name: soldItem.name,
          price: soldItem.price,
          soldCount: 0,
          profitGenerated: 0,
          buyingPrice: soldItem.buyingPrice || 0
        })
      }
      const entry = itemSalesMap.get(soldItem.id)
      entry.soldCount += soldItem.quantity
      entry.profitGenerated += (soldItem.price - (soldItem.buyingPrice || 0)) * soldItem.quantity
    })
  })

  // 2. Compute Total Real-Time Current Asset Value of the Shop
  const totalCurrentStoreValue = items.value.reduce((sum, item) => {
    return sum + ((item.buyingPrice || 0) * item.quantity)
  }, 0)

  // 3. Compute Value Depletion delta over the timeframe per product
  let totalValueDecreased = 0

  const productValueShifts = items.value.map(item => {
    const saleEntry = itemSalesMap.get(item.id)
    const quantitySoldInWindow = saleEntry ? saleEntry.soldCount : 0
    const costBasis = item.buyingPrice || (saleEntry ? saleEntry.buyingPrice : 0) || 0

    const currentValue = item.quantity * costBasis
    const valueLostInSales = quantitySoldInWindow * costBasis
    const initialValue = currentValue + valueLostInSales

    totalValueDecreased += valueLostInSales

    return {
      id: item.id,
      name: item.name,
      initialValue,
      currentValue,
      valueLostInSales
    }
  }).sort((a, b) => b.valueLostInSales - a.valueLostInSales) // Put items changing the most at the top

  const performanceList: any[] = []
  itemSalesMap.forEach(entry => performanceList.push(entry))

  const deadStockList = items.value.filter(item => !itemSalesMap.has(item.id))
  const lowStockList = items.value.filter(item => item.quantity <= 3)

  return {
    totalRevenue,
    totalProfit,
    totalSalesCount,
    totalCurrentStoreValue,
    totalValueDecreased,
    productValueShifts,
    performanceList: performanceList.sort((a, b) => b.profitGenerated - a.profitGenerated),
    deadStockList,
    lowStockList
  }
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white p-6 pb-24">
    <div class="max-w-5xl mx-auto">

      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <NuxtLink to="/"
            class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1">
            ← Return to Inventory
          </NuxtLink>
          <h1 class="text-3xl font-black tracking-tight mt-1">Business Analytics</h1>
        </div>

        <div class="flex bg-zinc-900 rounded-2xl p-1 border border-zinc-800 self-start sm:self-auto">
          <button @click="activeTimeframe = 'day'"
            :class="activeTimeframe === 'day' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500'"
            class="px-3.5 py-2 rounded-xl text-xs font-black transition-all">
            Today (24h)
          </button>
          <button @click="activeTimeframe = 'week'"
            :class="activeTimeframe === 'week' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500'"
            class="px-3.5 py-2 rounded-xl text-xs font-black transition-all">
            7 Days
          </button>
          <button @click="activeTimeframe = 'month'"
            :class="activeTimeframe === 'month' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500'"
            class="px-3.5 py-2 rounded-xl text-xs font-black transition-all">
            30 Days
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          class="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-6 text-3xl opacity-10 select-none">🏬</div>
          <div class="text-zinc-500 text-xs font-bold uppercase tracking-wider">Current Shop Floor Stock Value</div>
          <div class="text-3xl font-black text-white mt-2 font-mono">
            {{ reportMetrics.totalCurrentStoreValue.toLocaleString() }} <span
              class="text-sm font-normal text-zinc-500">ETB</span>
          </div>
          <p class="text-[11px] text-zinc-500 mt-2">Total active net cost tied up in product quantities sitting on
            shelves right now.</p>
        </div>

        <div
          class="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-6 text-3xl opacity-10 select-none">📉</div>
          <div class="text-zinc-500 text-xs font-bold uppercase tracking-wider">Stock Value Shift (Sales Depletion)
          </div>
          <div class="text-3xl font-black text-amber-500 mt-2 font-mono">
            -{{ reportMetrics.totalValueDecreased.toLocaleString() }} <span
              class="text-sm font-normal text-zinc-500">ETB</span>
          </div>
          <p class="text-[11px] text-zinc-500 mt-2">Wholesale cost basis value extracted and converted into gross income
            during this timeframe.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="text-zinc-500 text-xs font-bold uppercase tracking-wider">Gross Profit</div>
          <div class="text-2xl font-black text-emerald-400 mt-2 font-mono">
            {{ reportMetrics.totalProfit.toLocaleString() }} <span class="text-xs">ETB</span>
          </div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Revenue Turnover</div>
          <div class="text-2xl font-black text-zinc-100 mt-2 font-mono">
            {{ reportMetrics.totalRevenue.toLocaleString() }} <span class="text-xs text-zinc-500">ETB</span>
          </div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="text-zinc-500 text-xs font-bold uppercase tracking-wider">Product Items Moved</div>
          <div class="text-2xl font-black text-zinc-100 mt-2 font-mono">
            {{ reportMetrics.totalSalesCount }} <span class="text-xs text-zinc-500">pcs</span>
          </div>
        </div>
      </div>

      <div v-if="reportMetrics.lowStockList.length > 0"
        class="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
        <h3 class="text-amber-500 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
          ⚠️ Critical Reorder Alert (Low Stock)
        </h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="item in reportMetrics.lowStockList" :key="item.id"
            class="bg-zinc-950 border border-amber-500/10 px-3 py-2 rounded-xl text-xs flex items-center gap-3">
            <span class="font-bold text-zinc-300">{{ item.name }}</span>
            <span class="text-amber-400 font-black px-1.5 py-0.5 bg-amber-500/10 rounded-md">{{ item.quantity }}
              left</span>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 pl-1">
          Stock Value Depletion Mapping (Initial Value → Current Value)
        </h2>
        <div class="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
          <div v-for="product in reportMetrics.productValueShifts" :key="product.id"
            class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-900/60 transition-colors">
            <div>
              <span class="font-bold text-sm text-zinc-200 block">{{ product.name }}</span>
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Warehouse Asset Footprint</span>
            </div>

            <div class="flex items-center gap-2.5 sm:gap-4 font-mono font-bold text-xs sm:text-sm">
              <span class="text-zinc-400 bg-zinc-950 px-2.5 py-1.5 border border-zinc-850 rounded-xl">
                {{ product.initialValue.toLocaleString() }} <span class="text-[10px] text-zinc-600">ETB</span>
              </span>
              <span class="text-zinc-600 text-sm select-none">→</span>
              <span
                :class="product.currentValue === 0 ? 'text-zinc-500 bg-zinc-950/40 line-through' : 'text-white bg-zinc-950'"
                class="px-2.5 py-1.5 border border-zinc-850 rounded-xl">
                {{ product.currentValue.toLocaleString() }} <span class="text-[10px] text-zinc-500">ETB</span>
              </span>

              <span v-if="product.valueLostInSales > 0"
                class="text-amber-500 bg-amber-500/5 px-2 py-1 rounded-lg text-[10px] shrink-0 border border-amber-500/10">
                -{{ product.valueLostInSales.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 pl-1">Profit Leaderboard (Top
            Sellers)</h2>
          <div v-if="reportMetrics.performanceList.length === 0"
            class="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-6 text-center text-zinc-600 text-xs">
            No transactions cleared inside this report interval.
          </div>
          <div v-else class="space-y-1.5">
            <div v-for="item in reportMetrics.performanceList" :key="item.id"
              class="bg-zinc-900 border border-zinc-850 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div class="font-bold text-sm text-zinc-200">{{ item.name }}</div>
                <div class="text-zinc-500 text-xs mt-0.5">{{ item.soldCount }} total items clear</div>
              </div>
              <div class="text-right">
                <div class="text-emerald-400 font-mono font-black text-sm">+{{ item.profitGenerated.toLocaleString() }}
                  ETB</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 pl-1">Stagnant Shelf Items (Zero
            Sales)</h2>
          <div v-if="reportMetrics.deadStockList.length === 0"
            class="text-emerald-400 bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-4 text-center text-xs font-bold">
            Awesome! Everything on the shelf moved during this period window.
          </div>
          <div v-else class="grid grid-cols-2 gap-2">
            <div v-for="item in reportMetrics.deadStockList" :key="item.id"
              class="bg-zinc-900/30 border border-zinc-850 p-3 rounded-xl flex justify-between items-center text-xs">
              <div class="text-zinc-400 truncate pr-2 font-medium">{{ item.name }}</div>
              <span class="text-zinc-500 font-mono font-bold shrink-0">{{ item.quantity }} resting</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
