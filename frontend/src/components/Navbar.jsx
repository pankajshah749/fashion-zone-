import { Link, NavLink } from "react-router-dom"
import { Heart, ShoppingBag, Search, Menu, X } from "lucide-react"
import { useState } from "react"
import { useStore } from "../context/StoreContext"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { cartCount, wishlist } = useStore()

  return <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4">
      <Link to="/" className="text-2xl font-black tracking-tight">FASHION <span className="text-rose-600">ZONE</span></Link>
      <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
        <NavLink to="/">Home</NavLink><NavLink to="/shop">Shop</NavLink><NavLink to="/wishlist">Wishlist</NavLink>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/shop"><Search size={20}/></Link>
        <Link to="/wishlist" className="relative"><Heart size={20}/><span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 text-[10px] text-white">{wishlist.length}</span></Link>
        <Link to="/cart" className="relative"><ShoppingBag size={20}/><span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 text-[10px] text-white">{cartCount}</span></Link>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      </div>
    </div>
    {open && <div className="border-t bg-white px-4 py-4 md:hidden"><div className="flex flex-col gap-4"><Link to="/" onClick={()=>setOpen(false)}>Home</Link><Link to="/shop" onClick={()=>setOpen(false)}>Shop</Link><Link to="/wishlist" onClick={()=>setOpen(false)}>Wishlist</Link></div></div>}
  </header>
}
