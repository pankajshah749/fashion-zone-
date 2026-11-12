import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../api"
import ProductCard from "../components/ProductCard"

const defaultFilters = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "featured",
  inStockOnly: false,
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("min_price") || "",
    maxPrice: searchParams.get("max_price") || "",
    sortBy: searchParams.get("ordering") || "featured",
    inStockOnly: searchParams.get("in_stock") === "true",
  }))

  useEffect(() => {
    api.get("categories/").then(r => setCategories(r.data)).catch(() => setCategories([]))
    api.get("products/").then(r => setAllProducts(r.data)).catch(() => setAllProducts([]))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.category) params.set("category", filters.category)
    if (filters.minPrice) params.set("min_price", filters.minPrice)
    if (filters.maxPrice) params.set("max_price", filters.maxPrice)
    if (filters.sortBy && filters.sortBy !== "featured") params.set("ordering", filters.sortBy)
    if (filters.inStockOnly) params.set("in_stock", "true")

    setSearchParams(params, { replace: true })

    api
      .get(`products/?${params.toString()}`)
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
  }, [filters, setSearchParams])

  const suggestions = useMemo(() => {
    const term = filters.search.trim().toLowerCase()
    if (!term) return []
    return allProducts
      .filter(product => `${product.name} ${product.category_name || ""}`.toLowerCase().includes(term))
      .slice(0, 6)
  }, [allProducts, filters.search])

  const resetFilters = () => setFilters({ ...defaultFilters })
  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8">
      <h1 className="text-4xl font-black">Shop Collection</h1>
      <p className="mt-2 text-zinc-500">Find the style that feels like you.</p>
    </div>

    <div className="mb-8 flex flex-wrap gap-2">
      <button onClick={() => updateFilter("category", "")} className={`rounded-full border px-4 py-2 text-sm font-semibold ${!filters.category ? "border-black bg-black text-white" : "bg-white"}`}>
        All
      </button>
      {categories.map(category => (
        <button key={category.id} onClick={() => updateFilter("category", category.slug)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${filters.category === category.slug ? "border-black bg-black text-white" : "bg-white"}`}>
          {category.name}
        </button>
      ))}
    </div>

    <div className="mb-8 grid gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-[1.4fr_1fr_1fr_1.1fr_auto]">
      <div className="relative">
        <input
          value={filters.search}
          onChange={e => updateFilter("search", e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200"
        />
        {filters.search.trim() && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
            {suggestions.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  updateFilter("search", product.name)
                  updateFilter("category", product.category_name ? categories.find(cat => cat.name === product.category_name)?.slug || "" : "")
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-50"
              >
                <span>{product.name}</span>
                <span className="text-zinc-500">{product.category_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <select value={filters.category} onChange={e => updateFilter("category", e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200">
        <option value="">All categories</option>
        {categories.map(category => <option key={category.id} value={category.slug}>{category.name}</option>)}
      </select>

      <input type="number" min="0" value={filters.minPrice} onChange={e => updateFilter("minPrice", e.target.value)} placeholder="Min price" className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200" />
      <input type="number" min="0" value={filters.maxPrice} onChange={e => updateFilter("maxPrice", e.target.value)} placeholder="Max price" className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200" />

      <div className="flex items-center gap-3">
        <select value={filters.sortBy} onChange={e => updateFilter("sortBy", e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200">
          <option value="featured">Featured</option>
          <option value="-created_at">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-zinc-700">
          <input type="checkbox" checked={filters.inStockOnly} onChange={e => updateFilter("inStockOnly", e.target.checked)} />
          In stock
        </label>
      </div>
    </div>

    <div className="mb-6 flex items-center justify-between gap-4">
      <p className="text-sm text-zinc-600">{products.length} product{products.length === 1 ? "" : "s"} found</p>
      <button onClick={resetFilters} className="text-sm font-semibold underline">Reset filters</button>
    </div>

    {products.length ? (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>
    ) : (
      <div className="rounded-2xl bg-zinc-100 p-12 text-center">No products found. Try different filters or check back soon.</div>
    )}
  </main>
}
