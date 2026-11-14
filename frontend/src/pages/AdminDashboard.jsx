import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, BarChart3, CreditCard, Package2, TrendingUp } from "lucide-react"
import api from "../api"

const defaultStats = {
  totalRevenue: 0,
  totalOrders: 0,
  activeProducts: 0,
  averageOrder: 0,
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(defaultStats)
  const [isAdmin, setIsAdmin] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("admin/stats/")
        setIsAdmin(true)
        setStats({
          totalRevenue: Number(data.total_revenue || 0),
          totalOrders: Number(data.total_orders || 0),
          activeProducts: Number(data.active_products || 0),
          averageOrder: Number(data.average_order || 0),
        })
        setProducts(data.top_products || [])
        setOrders(data.status_breakdown || [])
      } catch (error) {
        setIsAdmin(false)
        try {
          const [productResponse, orderResponse] = await Promise.all([
            api.get("products/").catch(() => ({ data: [] })),
            api.get("orders/").catch(() => ({ data: [] })),
          ])

          const productList = productResponse.data || []
          const orderList = orderResponse.data || []
          setProducts(productList)
          setOrders(orderList)

          const revenue = orderList.reduce((sum, order) => sum + Number(order.total || 0), 0)
          const averageOrder = orderList.length ? revenue / orderList.length : 0
          setStats({
            totalRevenue: revenue,
            totalOrders: orderList.length,
            activeProducts: productList.length,
            averageOrder,
          })
        } catch {
          setProducts([])
          setOrders([])
          setStats(defaultStats)
        }
      }
    }

    loadDashboard()
  }, [])

  const categoryBreakdown = useMemo(() => {
    if (products.length && typeof products[0]?.category === "string") {
      return products.map(product => ({ name: product.category || "Uncategorized", count: product.sold || 1 }))
    }

    const groups = {}
    products.forEach(product => {
      const key = product.category_name || product.category || "Uncategorized"
      groups[key] = (groups[key] || 0) + 1
    })
    return Object.entries(groups).map(([name, count]) => ({ name, count }))
  }, [products])

  const statusBreakdown = useMemo(() => {
    if (orders.length && typeof orders[0]?.status === "string") {
      return orders.map(entry => [entry.status, entry.count])
    }

    const groups = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
    orders.forEach(order => {
      const status = order.status || "pending"
      if (groups[status] !== undefined) groups[status] += 1
    })
    return Object.entries(groups)
  }, [orders])

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-600">Reports</p>
      <h1 className="mt-2 text-4xl font-black">Admin analytics dashboard</h1>
      {!isAdmin && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo view: sign in as a Django admin user to access the protected analytics endpoint.
        </p>
      )}
    </div>

    <div className="mb-8 grid gap-4 md:grid-cols-4">
      <MetricCard icon={<TrendingUp size={20} />} label="Revenue" value={`Rs. ${Number(stats.totalRevenue).toFixed(2)}`} accent="text-emerald-600" />
      <MetricCard icon={<Package2 size={20} />} label="Orders" value={stats.totalOrders} accent="text-sky-600" />
      <MetricCard icon={<BarChart3 size={20} />} label="Products" value={stats.activeProducts} accent="text-violet-600" />
      <MetricCard icon={<CreditCard size={20} />} label="Avg. order" value={`Rs. ${Number(stats.averageOrder).toFixed(2)}`} accent="text-amber-600" />
    </div>

    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Category performance</h2>
        <div className="mt-6 space-y-4">
          {categoryBreakdown.length ? categoryBreakdown.map(item => (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold">{item.name}</span>
                <span className="text-zinc-500">{item.count} items</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${Math.min((item.count / Math.max(...categoryBreakdown.map(entry => entry.count), 1)) * 100, 100)}%` }} />
              </div>
            </div>
          )) : <p className="text-zinc-500">No category data available.</p>}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Order flow</h2>
        <div className="mt-6 space-y-4">
          {statusBreakdown.map(([status, count]) => (
            <div key={status} className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3">
              <span className="font-semibold capitalize">{status}</span>
              <span className="text-zinc-500">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">Top products</h2>
        <button className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-sm font-semibold">
          Export report <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {products.slice(0, 6).map((product, index) => (
          <div key={product.id || `${product.name}-${index}`} className="rounded-2xl bg-zinc-50 p-4">
            <p className="font-bold">{product.name || product.product_name}</p>
            <p className="mt-1 text-sm text-zinc-500">{product.category || product.category_name || product.product__category__name || "General"}</p>
            <p className="mt-3 text-lg font-black">
              {typeof product.price === "number" ? `Rs. ${Number(product.price).toFixed(2)}` : `${product.sold || 0} sold`}
            </p>
          </div>
        ))}
      </div>
    </div>
  </main>
}

function MetricCard({ icon, label, value, accent }) {
  return <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
    <div className={`mb-4 inline-flex rounded-full bg-zinc-100 p-2 ${accent}`}>{icon}</div>
    <p className="text-sm text-zinc-500">{label}</p>
    <p className="mt-2 text-3xl font-black">{value}</p>
  </div>
}
