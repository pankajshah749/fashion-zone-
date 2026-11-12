import { Link, NavLink } from "react-router-dom"
import { Heart, ShoppingBag, Search, Menu, X, MoonStar, SunMedium, UserRound, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { useStore } from "../context/StoreContext"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { cartCount, wishlist, theme, toggleTheme } = useStore()

  const headerStyle = theme === "dark"
    ? "border-white/10 bg-zinc-950/65 shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150"
    : "border-zinc-200/80 bg-white/80 backdrop-blur-md"

  return <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${headerStyle}`}>
    <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4">
      <Link to="/" className="text-2xl font-black tracking-tight">FASHION <span className="text-rose-600">ZONE</span></Link>

      <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/wishlist">Wishlist</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>

      <div className="flex items-center gap-3">
        <Link to="/shop" aria-label="Search products" className="rounded-full border border-zinc-200 p-2 dark:border-zinc-700"><Search size={18} /></Link>
        <Link to="/wishlist" className="relative rounded-full border border-zinc-200 p-2 dark:border-zinc-700" aria-label="Wishlist"><Heart size={18} /><span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 text-[10px] text-white">{wishlist.length}</span></Link>
        <Link to="/cart" className="relative rounded-full border border-zinc-200 p-2 dark:border-zinc-700" aria-label="Cart"><ShoppingBag size={18} /><span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 text-[10px] text-white">{cartCount}</span></Link>
        <Link to="/profile" aria-label="Profile" className="hidden rounded-full border border-zinc-200 p-2 md:inline-flex dark:border-zinc-700"><UserRound size={18} /></Link>
        <Link to="/dashboard" aria-label="Dashboard" className="hidden rounded-full border border-zinc-200 p-2 md:inline-flex dark:border-zinc-700"><LayoutDashboard size={18} /></Link>
        <button onClick={toggleTheme} aria-label="Toggle theme" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-semibold shadow-sm transition hover:border-rose-300 hover:bg-rose-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
          {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
          <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>

    {open && <div className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950"><div className="flex flex-col gap-4"><Link to="/" onClick={()=>setOpen(false)}>Home</Link><Link to="/shop" onClick={()=>setOpen(false)}>Shop</Link><Link to="/wishlist" onClick={()=>setOpen(false)}>Wishlist</Link><Link to="/orders" onClick={()=>setOpen(false)}>Orders</Link><Link to="/dashboard" onClick={()=>setOpen(false)}>Dashboard</Link><Link to="/profile" onClick={()=>setOpen(false)}>Profile</Link></div></div>}
  </header>
}
