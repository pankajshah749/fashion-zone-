import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../api"
import ProductCard from "../components/ProductCard"

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState(() => searchParams.get("search") || "")
  const [category, setCategory] = useState(() => searchParams.get("category") || "")
  const [categories, setCategories] = useState([])

  useEffect(() => { api.get("categories/").then(r => setCategories(r.data)).catch(()=>{}) }, [])
  useEffect(() => {
    setSearchParams(params => {
      if (search) params.set("search", search)
      else params.delete("search")
      if (category) params.set("category", category)
      else params.delete("category")
      return params
    }, { replace: true })
    const params = new URLSearchParams()
    if(search) params.set("search", search)
    if(category) params.set("category", category)
    api.get(`products/?${params}`).then(r => setProducts(r.data)).catch(()=>setProducts([]))
  }, [search, category])

  const chooseCategory = (slug) => {
    setCategory(slug)
    setSearchParams(params => {
      if (slug) params.set("category", slug)
      else params.delete("category")
      return params
    })
  }

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8"><h1 className="text-4xl font-black">Shop Collection</h1><p className="mt-2 text-zinc-500">Find the style that feels like you.</p></div>
    <div className="mb-8 flex flex-wrap gap-2">
      <button onClick={() => chooseCategory("")} className={`rounded-full border px-4 py-2 text-sm font-semibold ${!category ? "border-black bg-black text-white" : "bg-white"}`}>All</button>
      {categories.map(c => <button key={c.id} onClick={() => chooseCategory(c.slug)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${category === c.slug ? "border-black bg-black text-white" : "bg-white"}`}>{c.name}</button>)}
    </div>
    <div className="mb-8 flex flex-col gap-3 md:flex-row">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 md:w-96"/>
      <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border px-4 py-3"><option value="">All categories</option>{categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select>
    </div>
    {products.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div> : <div className="rounded-2xl bg-zinc-100 p-12 text-center">No products found. Add products through Django Admin.</div>}
  </main>
}
