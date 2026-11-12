import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../context/StoreContext"
import api from "../api"

export default function Checkout(){
 const {cart,total}=useStore(), nav=useNavigate()
 const [form,setForm]=useState({full_name:"",phone:"",city:"",area:"",address_line:""}), [message,setMessage]=useState("")
 const submit=async e=>{e.preventDefault();try{const address=await api.post("addresses/",form);await api.post("orders/",{address:address.data.id,payment_method:"Cash on Delivery",items:cart.map(x=>({product:x.id,quantity:x.quantity,size:x.size,color:x.color}))});setMessage("Order placed successfully!");setTimeout(()=>nav("/"),1500)}catch{setMessage("Please login before placing your order.")}}
 if(!cart.length) return <div className="p-16 text-center">Your cart is empty.</div>
 return <main className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2"><div><h1 className="text-3xl font-black">Checkout</h1><form onSubmit={submit} className="mt-6 space-y-3">{Object.entries(form).map(([key,val])=><input key={key} required placeholder={key.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())} value={val} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full rounded-xl border p-3"/>)}<button className="w-full rounded-xl bg-black py-4 font-bold text-white">Place Order • Rs. {total.toFixed(2)}</button>{message&&<p>{message}</p>}</form></div><aside className="rounded-2xl bg-zinc-100 p-6"><h2 className="font-bold">Your Order</h2>{cart.map((x,i)=><div key={i} className="mt-4 flex justify-between text-sm"><span>{x.name} × {x.quantity}</span><span>Rs. {(x.price*x.quantity).toFixed(2)}</span></div>)}<div className="mt-6 border-t pt-4 text-lg font-black">Total: Rs. {total.toFixed(2)}</div><p className="mt-4 text-sm text-zinc-500">Payment method: Cash on Delivery</p></aside></main>
}
