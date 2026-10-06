export interface InventoryItem {
  id: string
  name: string
  buyingPrice: number  // Track original wholesale cost basis
  price: number        // Customer-facing retail selling price
  quantity: number
  category?: string    // Optional category grouping
  lastUpdated: string
}

export interface SaleRecord {
  id: string
  date: string
  items: Array<{
    id: string
    name: string
    buyingPrice: number // Snapped historical cost basis at time of transaction
    price: number       // Snapped selling price at time of transaction
    quantity: number
  }>
  total: number
  profit: number       // Automatically tracks exactly what your mom earned on this order
}
