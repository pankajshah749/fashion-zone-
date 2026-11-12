import { Link } from "react-router-dom"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useStore } from "../context/StoreContext"
import { getProductImage } from "../utils/productImage"

export default function Cart() {
  const { cart, total, updateQuantity, removeFromCart } = useStore()
  if(!cart.length) return <main className="mx-auto max-w-4xl p-12 text-center"><h1 className="text-3xl font-black">Your cart is empty</h1><Link to="/shop" className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white">Continue Shopping</Link></main>
  return <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1fr_360px]"><div><h1 className="mb-6 text-3xl font-black">Shopping Cart</h1>{cart.map((item,i)=><div key={i} className="mb-4 flex gap-4 rounded-2xl border p-4"><img src={getProductImage(item, 300)} alt={item.name} className="h-28 w-24 rounded-xl object-cover"/><div className="flex flex-1 flex-col"><h3 className="font-bold">{item.name}</h3><p className="text-sm text-zinc-500">{item.size} {item.color && `• ${item.color}`}</p><p className="mt-1 font-bold">Rs. {item.price}</p><div className="mt-auto flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={()=>updateQuantity(i,item.quantity-1)}><Minus size={16}/></button><span>{item.quantity}</span><button onClick={()=>updateQuantity(i,item.quantity+1)}><Plus size={16}/></button></div><button onClick={()=>removeFromCart(i)} className="text-rose-600"><Trash2 size={18}/></button></div></div></div>)}</div>
  <aside className="h-fit rounded-2xl bg-zinc-950 p-6 text-white"><h2 className="text-xl font-bold">Order Summary</h2><div className="my-6 flex justify-between text-lg"><span>Total</span><span className="font-black">Rs. {total.toFixed(2)}</span></div><Link to="/checkout" className="block rounded-xl bg-white py-3 text-center font-bold text-black">Proceed to Checkout</Link></aside></main>
}
