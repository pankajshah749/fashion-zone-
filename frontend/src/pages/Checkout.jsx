import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../context/StoreContext"
import api from "../api"

const couponMap = {
  SAVE10: 0.1,
  WELCOME20: 0.2,
  FREESHIP: 15,
}

export default function Checkout() {
  const { cart, total } = useStore()
  const nav = useNavigate()
  const [form, setForm] = useState({ full_name: "", phone: "", city: "", area: "", address_line: "" })
  const [message, setMessage] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery")
  const [wallet, setWallet] = useState({ balance: 0 })

  useEffect(() => {
    api.get("auth/wallet/").then(r => setWallet(r.data)).catch(() => setWallet({ balance: 0 }))
  }, [])

  const discount = useMemo(() => {
    if (!couponCode) return 0
    const normalized = couponCode.trim().toUpperCase()
    const percentOff = couponMap[normalized] || 0
    if (typeof percentOff === "number" && percentOff <= 1) {
      return total * percentOff
    }
    return Math.min(percentOff, total)
  }, [couponCode, total])

  const finalTotal = Math.max(total - discount, 0)

  const submit = async e => {
    e.preventDefault()
    try {
      const address = await api.post("addresses/", form)
      await api.post("orders/", {
        address: address.data.id,
        payment_method: paymentMethod,
        coupon_code: couponCode.trim().toUpperCase(),
        items: cart.map(x => ({ product: x.id, quantity: x.quantity, size: x.size, color: x.color })),
      })
      setMessage("Order placed successfully!")
      setTimeout(() => nav("/orders"), 1200)
    } catch (error) {
      const serverMessage = error?.response?.data?.non_field_errors?.[0] || error?.response?.data?.detail || "Please login before placing your order."
      setMessage(serverMessage)
    }
  }

  if (!cart.length) return <div className="p-16 text-center">Your cart is empty.</div>

  return <main className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2">
    <div>
      <h1 className="text-3xl font-black">Checkout</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {Object.entries(form).map(([key, val]) => (
          <input
            key={key}
            required
            placeholder={key.replaceAll("_", " ").replace(/\w/g, c => c.toUpperCase())}
            value={val}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3"
          />
        ))}

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <label className="mb-2 block text-sm font-semibold">Payment method</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white p-3">
            <option>Cash on Delivery</option>
            <option>Wallet</option>
            <option>Card</option>
          </select>
          {paymentMethod === "Wallet" && (
            <p className="mt-3 text-sm text-zinc-600">Wallet balance: Rs. {Number(wallet.balance || 0).toFixed(2)}</p>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
          <label className="mb-2 block text-sm font-semibold">Promo code</label>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              placeholder="SAVE10, WELCOME20, FREESHIP"
              className="flex-1 rounded-xl border border-zinc-200 bg-white p-3"
            />
            <button type="button" onClick={() => setCouponCode("SAVE10")} className="rounded-xl bg-rose-600 px-4 font-semibold text-white">Demo</button>
          </div>
        </div>

        <button className="w-full rounded-xl bg-black py-4 font-bold text-white">Place Order ? Rs. {finalTotal.toFixed(2)}</button>
        {message && <p className="text-sm text-rose-600">{message}</p>}
      </form>
    </div>

    <aside className="rounded-2xl bg-zinc-100 p-6">
      <h2 className="font-bold">Your Order</h2>
      {cart.map((x, i) => (
        <div key={i} className="mt-4 flex justify-between text-sm">
          <span>{x.name} ? {x.quantity}</span>
          <span>Rs. {(x.price * x.quantity).toFixed(2)}</span>
        </div>
      ))}
      <div className="mt-6 space-y-3 border-t pt-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>Rs. {total.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>- Rs. {discount.toFixed(2)}</span></div>
      </div>
      <div className="mt-6 border-t pt-4 text-lg font-black">Total: Rs. {finalTotal.toFixed(2)}</div>
      <p className="mt-4 text-sm text-zinc-500">Payment method: {paymentMethod}</p>
    </aside>
  </main>
}
