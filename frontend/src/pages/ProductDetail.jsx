import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api"
import { useStore } from "../context/StoreContext"
import { getProductImage } from "../utils/productImage"

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const { addToCart } = useStore()

  useEffect(()=>{api.get(`products/${slug}/`).then(r=>{setProduct(r.data); setSize(r.data.sizes?.[0]||""); setColor(r.data.colors?.[0]||"")})},[slug])
  if(!product) return <div className="p-20 text-center">Loading...</div>

  return <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
    <div className="overflow-hidden rounded-3xl bg-zinc-100"><img src={getProductImage(product, 1000)} className="h-[620px] w-full object-cover" alt={product.name}/></div>
    <div className="py-4"><p className="text-sm font-bold uppercase tracking-widest text-rose-600">{product.category_name}</p><h1 className="mt-2 text-4xl font-black">{product.name}</h1><div className="mt-5 text-2xl font-bold">Rs. {product.price}</div><p className="mt-6 leading-7 text-zinc-600">{product.description}</p>
      {product.sizes?.length>0 && <div className="mt-8"><h3 className="mb-3 font-bold">Size</h3><div className="flex gap-2">{product.sizes.map(s=><button key={s} onClick={()=>setSize(s)} className={`rounded-lg border px-4 py-2 ${size===s?"border-black bg-black text-white":""}`}>{s}</button>)}</div></div>}
      {product.colors?.length>0 && <div className="mt-6"><h3 className="mb-3 font-bold">Color</h3><div className="flex flex-wrap gap-2">{product.colors.map(c=><button key={c} onClick={()=>setColor(c)} className={`rounded-lg border px-4 py-2 ${color===c?"border-black bg-black text-white":""}`}>{c}</button>)}</div></div>}
      <button onClick={()=>addToCart(product,size,color)} className="mt-10 w-full rounded-xl bg-zinc-950 py-4 font-bold text-white transition hover:bg-rose-600">Add to Cart</button>
    </div>
  </main>
}
