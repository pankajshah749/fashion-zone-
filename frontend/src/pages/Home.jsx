import { Link } from "react-router-dom"
import { ArrowRight, Truck, ShieldCheck, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import api from "../api"
import ProductCard from "../components/ProductCard"
import { useStore } from "../context/StoreContext"

export default function Home() {
  const [products, setProducts] = useState([])
  const { recentlyViewed } = useStore()

  useEffect(() => { api.get("products/?featured=true").then(r => setProducts(r.data)).catch(() => setProducts([])) }, [])

  return <>
    <section className="bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div><p className="mb-4 text-sm font-semibold tracking-[.25em] text-rose-400">NEW COLLECTION 2026</p><h1 className="max-w-xl text-5xl font-black leading-tight md:text-7xl">Dress with confidence.</h1><p className="mt-6 max-w-lg text-zinc-300">Discover modern clothing curated for every moment, from everyday essentials to statement looks.</p><Link to="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black">Shop Collection <ArrowRight size={18}/></Link></div>
        <div className="overflow-hidden rounded-3xl"><img className="h-[500px] w-full object-cover" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85" alt="Fashion collection" /></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16"><div className="mb-10 flex items-end justify-between"><div><p className="text-sm font-bold text-rose-600">TRENDING NOW</p><h2 className="text-3xl font-black">Featured styles</h2></div><Link to="/shop" className="text-sm font-semibold underline">View all</Link></div>
      {products.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4"><>{products.map(p => <ProductCard key={p.id} product={p} />)}</></div> : <div className="rounded-2xl bg-zinc-100 p-10 text-center text-zinc-500">Add featured products from Django Admin to display them here.</div>}
    </section>

    {recentlyViewed.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose-600">Your activity</p>
            <h2 className="text-3xl font-black">Recently viewed</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {recentlyViewed.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    )}

    <section className="border-y bg-zinc-50"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
      <Feature icon={<Truck />} title="Fast Delivery" text="Reliable delivery across Nepal." />
      <Feature icon={<ShieldCheck />} title="Secure Shopping" text="Your account and order data are protected." />
      <Feature icon={<RotateCcw />} title="Easy Returns" text="Simple support for eligible returns." />
    </div></section>
  </>
}
function Feature({ icon, title, text }) { return <div className="flex gap-4"><div className="rounded-full bg-white p-3 shadow-sm">{icon}</div><div><h3 className="font-bold">{title}</h3><p className="text-sm text-zinc-500">{text}</p></div></div> }
