import { useEffect,useState } from "react"; import api from "../api"
const statusSteps = ["pending", "processing", "shipped", "delivered"]

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("orders/")
      .then(r => setOrders(r.data))
      .catch(() => setError("Please login to view your orders."))
  }, [])

  return <main className="mx-auto max-w-5xl px-4 py-10">
    <h1 className="text-3xl font-black">My Orders</h1>
    {error && <p className="mt-5 text-rose-600">{error}</p>}

    {!error && orders.length === 0 && <div className="mt-6 rounded-2xl bg-zinc-100 p-10 text-center">You do not have any orders yet.</div>}

    {orders.map(order => {
      const currentStep = statusSteps.indexOf(order.status)
      return <div key={order.id} className="mt-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Order #{order.id}</p>
            <h2 className="mt-1 text-xl font-black">{new Date(order.created_at).toLocaleDateString()}</h2>
          </div>
          <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-sm font-bold capitalize text-rose-700">{order.status}</span>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-4">
          {statusSteps.map((step, index) => (
            <div key={step} className={`rounded-2xl border p-3 text-sm ${index <= currentStep ? "border-rose-200 bg-rose-50 text-rose-700" : "border-zinc-200 bg-zinc-50 text-zinc-500"}`}>
              <div className="font-bold capitalize">{step}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="space-y-2">{order.items.map(item => <div key={item.id} className="text-sm"><span className="font-semibold">{item.product_name}</span> {item.size && `• ${item.size}`} {item.color && `• ${item.color}`} × {item.quantity}</div>)}</div>
          <div className="text-right">
            {order.coupon_code && <p className="text-sm text-zinc-500">Coupon: {order.coupon_code}</p>}
            {order.discount_amount > 0 && <p className="text-sm text-zinc-500">Discount: Rs. {Number(order.discount_amount).toFixed(2)}</p>}
            <p className="mt-2 text-xl font-black">Rs. {Number(order.total).toFixed(2)}</p>
          </div>
        </div>
      </div>
    })}
  </main>
}
