import { Link } from "react-router-dom"
import { Heart } from "lucide-react"
import { useStore } from "../context/StoreContext"
import { getProductImage } from "../utils/productImage"

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist } = useStore()
  const wished = wishlist.some(x => x.id === product.id)
  const image = getProductImage(product)

  return <div className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white transition hover:-translate-y-1 hover:shadow-xl">
    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
      <Link to={`/product/${product.slug}`}><img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/></Link>
      <button onClick={() => toggleWishlist(product)} className={`absolute right-3 top-3 rounded-full bg-white p-2 shadow ${wished ? "text-rose-600" : ""}`}><Heart size={18} fill={wished ? "currentColor" : "none"}/></button>
    </div>
    <div className="p-4">
      <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">{product.category_name || "Fashion"}</p>
      <Link to={`/product/${product.slug}`} className="font-semibold">{product.name}</Link>
      <div className="mt-3 flex items-center gap-2"><span className="font-bold">Rs. {product.price}</span>{product.old_price && <span className="text-sm text-zinc-400 line-through">Rs. {product.old_price}</span>}</div>
    </div>
  </div>
}
