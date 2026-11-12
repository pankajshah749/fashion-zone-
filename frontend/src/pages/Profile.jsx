import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package, MapPinned, UserCircle2, Wallet as WalletIcon, Plus } from "lucide-react"
import api from "../api"
import { useStore } from "../context/StoreContext"

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState({ balance: 0 })
  const [error, setError] = useState("")
  const { wishlist } = useStore()

  const loadProfile = async () => {
    try {
      const profileResponse = await api.get("auth/me/")
      const walletResponse = await api.get("auth/wallet/")
      setProfile(profileResponse.data)
      setWallet(walletResponse.data)
    } catch {
      setError("Please login to view your profile.")
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const topUpWallet = async (amount) => {
    try {
      const response = await api.post("auth/wallet/", { amount })
      setWallet(response.data)
      setProfile(prev => prev ? { ...prev, wallet_balance: response.data.balance } : prev)
    } catch {
      setError("Unable to top up wallet right now.")
    }
  }

  if (error) {
    return <main className="mx-auto max-w-4xl px-4 py-16"><div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-black">Profile</h1><p className="mt-4 text-zinc-600">{error}</p><Link to="/auth" className="mt-6 inline-block rounded-full bg-black px-5 py-3 font-semibold text-white">Login to continue</Link></div></main>
  }

  if (!profile) {
    return <main className="mx-auto max-w-4xl px-4 py-16"><div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">Loading profile...</div></main>
  }

  return <main className="mx-auto max-w-6xl px-4 py-10">
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-rose-600">Account</p>
        <h1 className="mt-2 text-4xl font-black">My profile</h1>
      </div>
      <Link to="/orders" className="rounded-full bg-zinc-950 px-5 py-3 font-semibold text-white">View orders</Link>
    </div>

    <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-rose-100 p-3 text-rose-600"><UserCircle2 size={28} /></div>
          <div>
            <p className="text-sm text-zinc-500">Welcome back</p>
            <h2 className="text-2xl font-black">{profile.first_name || profile.username}</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoBlock label="Username" value={profile.username} />
          <InfoBlock label="Email" value={profile.email || "Not provided"} />
          <InfoBlock label="Orders" value={profile.orders_count} />
          <InfoBlock label="Saved addresses" value={profile.addresses_count} />
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <WalletIcon className="text-rose-600" />
          <h3 className="text-xl font-black">Wallet</h3>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Available balance</p>
        <p className="mt-2 text-4xl font-black text-rose-600">Rs. {Number(wallet.balance || profile.wallet_balance || 0).toFixed(2)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[250, 500, 1000].map(amount => (
            <button key={amount} onClick={() => topUpWallet(amount)} className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-3 py-2 text-sm font-semibold text-white">
              <Plus size={14} />
              Rs. {amount}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <MapPinned className="text-rose-600" />
          <h3 className="text-xl font-black">Address details</h3>
        </div>
        <p className="mt-4 text-zinc-600">Keep your delivery preferences updated to receive faster shipping and smoother order processing.</p>
        <Link to="/checkout" className="mt-5 inline-block rounded-full border border-zinc-300 px-4 py-2 font-semibold">Update delivery info</Link>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Package className="text-rose-600" />
          <h3 className="text-xl font-black">Track your latest order</h3>
        </div>
        <p className="mt-4 text-zinc-600">Stay on top of shipping updates and delivery milestones.</p>
        <Link to="/orders" className="mt-5 inline-block rounded-full bg-rose-600 px-5 py-3 font-semibold text-white">Go to order tracking</Link>
      </div>
    </div>
  </main>
}

function InfoBlock({ label, value }) {
  return <div className="rounded-2xl bg-zinc-50 p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
    <p className="mt-2 text-lg font-bold">{value}</p>
  </div>
}
