import ProductCard from "../components/ProductCard"
import { useStore } from "../context/StoreContext"
export default function Wishlist(){const {wishlist}=useStore();return <main className="mx-auto max-w-7xl px-4 py-10"><h1 className="mb-8 text-3xl font-black">My Wishlist</h1>{wishlist.length?<div className="grid grid-cols-2 gap-4 md:grid-cols-4">{wishlist.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="rounded-2xl bg-zinc-100 p-12 text-center">Your wishlist is empty.</div>}</main>}
