<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { items, loadItems, recordSale } = useInventory()

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  maxStock: number
}

const cart = ref<CartItem[]>([])
const searchQuery = ref('')
const showSuggestions = ref(false)
const showConfirmModal = ref(false)

onMounted(async () => {
  await loadItems()
})

const filteredSuggestions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query || !items.value || items.value.length === 0) return []

  return items.value.filter(item => {
    if (!item) return false
    const cartMatch = cart.value.find(c => c.id === item.id)
    const availableStock = item.quantity - (cartMatch?.quantity || 0)
    return item.name.toLowerCase().includes(query) && availableStock > 0
  })
})

const addToCart = (product: any) => {
  if (!product) return

  const existingIndex = cart.value.findIndex(c => c.id === product.id)

  if (existingIndex > -1) {
    const existingItem = cart.value[existingIndex]
    if (existingItem && existingItem.quantity < product.quantity) {
      existingItem.quantity++
    }
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      maxStock: product.quantity
    })
  }

  searchQuery.value = ''
  showSuggestions.value = false
}

const updateQuantity = (index: number, change: number) => {
  const target = cart.value[index]
  if (!target) return

  const newQty = target.quantity + change

  if (newQty <= 0) {
    removeFromCart(index)
  } else if (newQty <= target.maxStock) {
    target.quantity = newQty
  }
}

const removeFromCart = (index: number) => {
  cart.value.splice(index, 1)
}

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const processCheckout = async () => {
  if (cart.value.length === 0) return

  await recordSale(cart.value)

  cart.value = []
  showConfirmModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 md:p-12 relative flex flex-col items-center select-none">
    <div class="w-full max-w-2xl pb-40">

      <div class="flex items-center gap-4 py-4 w-full">
        <NuxtLink to="/"
          class="p-3 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800/80 rounded-2xl transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight">Sell Items</h1>
          <p class="text-zinc-500 text-xs mt-0.5">Ring up new customer orders</p>
        </div>
      </div>

      <div class="relative mt-6">
        <div class="relative flex items-center">
          <input v-model="searchQuery" @focus="showSuggestions = true" @blur="handleBlur" type="text"
            placeholder="Search products by name..."
            class="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors" />
          <svg class="absolute left-4 text-zinc-600" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div v-if="showSuggestions && filteredSuggestions.length > 0"
          class="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl max-h-60 overflow-y-auto z-50 shadow-2xl p-2 space-y-1">
          <button v-for="product in filteredSuggestions" :key="product.id" @mousedown="addToCart(product)"
            class="w-full text-left p-3 hover:bg-zinc-800/60 rounded-xl transition-colors flex justify-between items-center">
            <div>
              <div class="font-bold text-sm text-zinc-200">{{ product.name }}</div>
              <div class="text-xs text-zinc-500 mt-0.5">In Stock: {{ product.quantity }}</div>
            </div>
            <div class="font-black text-sm text-emerald-400">{{ product.price }} ETB</div>
          </button>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 px-1">Current Cart Items</h2>

        <div v-if="cart.length === 0"
          class="bg-zinc-900/40 border border-zinc-800/60 border-dashed rounded-2xl p-8 text-center text-zinc-600 text-sm">
          Cart is empty. Use the search bar above to select products.
        </div>

        <div v-else class="space-y-2">
          <div v-for="(item, index) in cart" :key="item.id"
            class="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div class="flex-1 min-w-0 pr-4">
              <div class="font-bold text-sm text-zinc-100 truncate">{{ item.name }}</div>
              <div class="text-xs text-zinc-500 mt-0.5">{{ item.price }} ETB / unit</div>
            </div>

            <div class="flex items-center gap-3">
              <button @click="updateQuantity(index, -1)"
                class="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center font-bold text-zinc-300">-</button>
              <span class="w-6 text-center font-bold text-sm text-zinc-200">{{ item.quantity }}</span>
              <button @click="updateQuantity(index, 1)"
                class="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center font-bold text-zinc-300">+</button>
            </div>

            <div class="flex items-center gap-4 ml-6">
              <div class="text-right w-20">
                <span class="font-black text-sm text-emerald-400">{{ item.price * item.quantity }} ETB</span>
              </div>
              <button @click="removeFromCart(index)" class="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="cart.length > 0"
      class="fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 p-4 flex justify-center z-40">
      <div class="w-full max-w-2xl flex items-center justify-between gap-4">
        <div>
          <div class="text-xs text-zinc-500 uppercase tracking-wider font-bold">Grand Total</div>
          <div class="text-2xl font-black text-emerald-400 mt-0.5">{{ cartTotal }} ETB</div>
        </div>
        <button @click="showConfirmModal = true"
          class="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3.5 rounded-2xl font-black tracking-tight text-sm active:scale-95 transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2">
          Confirm Checkout
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="3">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showConfirmModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm text-center">
        <div
          class="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 class="text-lg font-black tracking-tight">Complete Sale?</h3>
        <p class="text-zinc-500 text-xs mt-1 px-4">This will deduct the quantities from inventory and log the
          transaction record.</p>

        <div class="grid grid-cols-2 gap-3 mt-6">
          <button @click="showConfirmModal = false"
            class="bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-bold text-sm text-zinc-300 transition-colors">
            Cancel
          </button>
          <button @click="processCheckout"
            class="bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl font-black text-sm text-black transition-colors">
            Yes, Complete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
