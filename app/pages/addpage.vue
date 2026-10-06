<script setup lang="ts">
import { ref } from 'vue'

const { items, saveItem, deleteItem, clearAllItems } = useInventory()

const form = ref({
  name: '',
  buyingPrice: 0,
  price: 0,
  quantity: 0
})

const menuopen = ref(false)
const targetEditId = ref<string | null>(null)
const clearAllOpen = ref(false)
const targetDeleteId = ref<string | null>(null)
const expanded = ref(new Set<string>())

const toggleExpand = (id: string) => {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}

const openAddModal = () => {
  targetEditId.value = null
  form.value = { name: '', buyingPrice: 0, price: 0, quantity: 0 }
  menuopen.value = true
}

const openEditModal = (item: any) => {
  targetEditId.value = item.id
  form.value = {
    name: item.name,
    buyingPrice: item.buyingPrice || 0,
    price: item.price,
    quantity: item.quantity
  }
  menuopen.value = true
}

const handleSaveProduct = async () => {
  if (!form.value.name.trim()) return

  const updatedItem = {
    id: targetEditId.value ? targetEditId.value : 'item_' + Date.now(),
    name: form.value.name.trim(),
    buyingPrice: Number(form.value.buyingPrice),
    price: Number(form.value.price),
    quantity: Number(form.value.quantity),
    lastUpdated: new Date().toISOString()
  }

  await saveItem(updatedItem)

  form.value = { name: '', buyingPrice: 0, price: 0, quantity: 0 }
  targetEditId.value = null
  menuopen.value = false
}

const triggerClearAll = async () => {
  if (typeof clearAllItems === 'function') {
    await clearAllItems()
  } else {
    for (const item of items.value) {
      await deleteItem(item.id)
    }
  }
  expanded.value.clear()
  clearAllOpen.value = false
}

// Triggered cleanly via tap now
const openDeleteModal = (id: string) => {
  targetDeleteId.value = id
}

const executeDelete = async () => {
  if (targetDeleteId.value) {
    await deleteItem(targetDeleteId.value)
    targetDeleteId.value = null
  }
}

const getTargetItemName = () => {
  return items.value.find(item => item.id === targetDeleteId.value)?.name || 'this item'
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white p-6 pb-28 relative">

    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-zinc-900 pb-5">
      <div>
        <NuxtLink to="/"
          class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 mb-1.5 group">
          <span class="group-hover:-translate-x-0.5 transition-transform">←</span> Return to Cash Register
        </NuxtLink>
        <h1 class="text-3xl font-black tracking-tight">Stock Inventory</h1>
        <p class="text-zinc-500 text-xs mt-0.5">Manage products and wholesale values</p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink to="/reports"
          class="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5">
          View Analytics →
        </NuxtLink>
        <button @click="openAddModal"
          class="bg-white text-black px-5 py-3 rounded-xl font-black text-xs shadow-lg hover:bg-zinc-200 transition-all active:scale-95">
          + Add Product
        </button>
      </div>
    </div>

    <div v-if="items.length === 0"
      class="border border-dashed border-zinc-800 rounded-3xl p-12 text-center my-10 max-w-xl mx-auto">
      <div class="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500 mb-4">
        📦
      </div>
      <h3 class="text-base font-bold text-zinc-200">No products listed yet</h3>
      <p class="text-zinc-500 text-xs max-w-xs mx-auto mt-1.5 mb-6">
        Add products with their wholesale buying cost and shelf sale price to track real profit metrics.
      </p>
      <button @click="openAddModal"
        class="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all">
        Create Your First Product Entry
      </button>
    </div>

    <Transition name="modal">
      <div v-if="menuopen" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        @click.self="menuopen = false">
        <div class="bg-zinc-900 w-full max-w-md rounded-3xl p-6 border border-zinc-800 shadow-2xl">
          <h2 class="text-xl font-black tracking-tight mb-6">
            {{ targetEditId ? 'Edit Product Details' : 'Add New Product' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 pl-1">Product
                Name</label>
              <input v-model="form.name" type="text" placeholder="e.g. Cooking Oil"
                class="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-500 placeholder-zinc-600 transition-all">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 pl-1">Buying Cost
                  (ETB)</label>
                <input v-model="form.buyingPrice" type="number" step="any" placeholder="0.00"
                  class="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-500 placeholder-zinc-600 transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 pl-1">Retail Price
                  (ETB)</label>
                <input v-model="form.price" type="number" step="any" placeholder="0.00"
                  class="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-500 placeholder-zinc-600 transition-all">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 pl-1">Stock
                Quantity</label>
              <input v-model="form.quantity" type="number" placeholder="0"
                class="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-500 placeholder-zinc-600 transition-all">
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button @click="menuopen = false"
              class="flex-1 py-3.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 text-sm transition-colors">
              Cancel
            </button>
            <button @click="handleSaveProduct"
              class="flex-1 py-3.5 bg-white text-black font-black rounded-xl hover:bg-zinc-200 text-sm transition-colors">
              {{ targetEditId ? 'Save Changes' : 'Add Item' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="targetDeleteId !== null"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        @click.self="targetDeleteId = null">
        <div class="bg-zinc-900 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border border-zinc-800/80">
          <div class="w-12 h-12 bg-red-950 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Delete Item?</h3>
          <p class="text-zinc-400 text-sm mb-6">Are you sure you want to remove <span class="text-white font-medium">"{{
              getTargetItemName() }}"</span>?</p>
          <div class="flex gap-3">
            <button @click="targetDeleteId = null"
              class="flex-1 py-3 bg-zinc-800 rounded-xl text-sm font-medium">Cancel</button>
            <button @click="executeDelete"
              class="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl text-sm shadow-md">Delete</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="clearAllOpen"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        @click.self="clearAllOpen = false">
        <div class="bg-zinc-900 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border border-zinc-800/80">
          <div class="w-12 h-12 bg-red-950 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="m15 11-6 6M9 11l6 6M18 11V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Nuke Inventory?</h3>
          <p class="text-zinc-400 text-sm mb-6">This completely clears out every trackable item. It cannot be undone.
          </p>
          <div class="flex gap-3">
            <button @click="clearAllOpen = false" class="flex-1 py-3 bg-zinc-800 rounded-xl text-sm font-medium">Keep
              Data</button>
            <button @click="triggerClearAll"
              class="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl text-sm shadow-md">Clear All</button>
          </div>
        </div>
      </div>
    </Transition>

    <TransitionGroup name="list" tag="div" class="flex flex-col gap-2.5 relative">
      <div v-for="item in items" :key="item.id"
        class="bg-zinc-900 border border-zinc-850 rounded-2xl relative transition-all duration-300">

        <div
          class="p-4 flex justify-between items-center cursor-pointer active:bg-zinc-800/40 select-none transition-colors"
          @click="toggleExpand(item.id)">
          <div>
            <h3 class="font-bold text-base text-zinc-100">{{ item.name }}</h3>
            <p class="text-emerald-400 font-black text-sm mt-0.5">{{ item.price.toLocaleString() }} ETB</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Available Stock</p>
            <p :class="item.quantity <= 3 ? 'text-amber-500' : 'text-zinc-200'" class="text-xl font-black mt-0.5">
              {{ item.quantity }}
            </p>
          </div>
        </div>

        <Transition name="expand">
          <div v-if="expanded.has(item.id)"
            class="px-4 pb-4 pt-2 border-t border-zinc-800/80 text-xs text-zinc-500 space-y-1.5 bg-zinc-900/40 rounded-b-2xl">
            <div class="flex justify-between">
              <span>Buying Cost Basis:</span>
              <span class="text-zinc-300 font-mono font-medium">{{ item.buyingPrice ? item.buyingPrice.toLocaleString()
                : '0' }} ETB</span>
            </div>
            <div class="flex justify-between">
              <span>Potential Markup Profit Margin:</span>
              <span class="text-emerald-500 font-mono font-bold">+{{ (item.price - (item.buyingPrice ||
                0)).toLocaleString() }} ETB</span>
            </div>
            <div class="flex justify-between border-t border-zinc-800/40 pt-1.5 mt-1">
              <span>Asset Stock Valuation:</span>
              <span class="text-white font-mono font-bold">{{ ((item.buyingPrice || 0) * item.quantity).toLocaleString()
                }} ETB</span>
            </div>

            <div class="flex justify-between items-center pt-3 mt-1 border-t border-zinc-800/40">
              <p class="text-[10px] text-zinc-600">Last updated: {{ new Date(item.lastUpdated).toLocaleString() }}</p>

              <div class="flex items-center gap-2">
                <button @click.stop="openEditModal(item)"
                  class="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1">
                  ✏️ Edit
                </button>
                <button @click.stop="openDeleteModal(item.id)"
                  class="bg-red-950/60 hover:bg-red-900/80 text-red-400 px-3 py-1.5 rounded-lg font-bold text-[11px] border border-red-900/30 transition-colors flex items-center gap-1">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </Transition>

      </div>
    </TransitionGroup>

    <div v-if="items.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
      <button @click="clearAllOpen = true"
        class="w-14 h-14 bg-zinc-900/90 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-400 shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" class="group-hover:rotate-6 transition-transform">
          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.list-leave-active {
  position: absolute;
  width: 100%;
  z-index: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease-out;
  max-height: 160px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active>div,
.modal-leave-active>div {
  transition: transform 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from>div {
  transform: scale(0.95) translateY(4px);
}

.modal-leave-to {
  opacity: 0;
}
</style>
