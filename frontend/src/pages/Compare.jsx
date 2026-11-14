import { Link } from "react-router-dom"
import { ArrowLeftRight, X } from "lucide-react"
import { useStore } from "../context/StoreContext"
import { getProductImage } from "../utils/productImage"

const comparisonRows = [
  { label: "Price", value: product => `Rs. ${Number(product.price).toFixed(2)}` },
  { label: "Availability", value: product => product.stock > 0 ? `${product.stock} in stock` : "Out of stock" },
  { label: "Category", value: product => product.category_name || "Fashion" },
  { label: "Rating", value: product => product.review_count ? `${product.average_rating} / 5 (${product.review_count} reviews)` : "No reviews yet" },
  { label: "Sizes", value: product => product.sizes?.length ? product.sizes.join(", ") : "One size" },
  { label: "Colors", value: product => product.colors?.length ? product.colors.join(", ") : "Not specified" },
]

export default function Compare() {
  const { compare, toggleCompare, addToCart } = useStore()

  if (!compare.length) {
    return <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <ArrowLeftRight className="mx-auto text-rose-600" size={40} />
      <h1 className="mt-5 text-3xl font-black">Compare products</h1>
      <p className="mt-3 text-zinc-600">Add a few products from the shop to compare their details side by side.</p>
      <Link to="/shop" className="mt-6 inline-block rounded-full bg-zinc-950 px-6 py-3 font-bold text-white">Browse products</Link>
    </main>
  }

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose-600">Make your choice</p>
        <h1 className="mt-2 text-4xl font-black">Compare products</h1>
        <p className="mt-2 text-zinc-500">Comparing {compare.length} of 4 products.</p>
      </div>
      <Link to="/shop" className="font-semibold underline">Add more products</Link>
    </div>

    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
        <thead>
          <tr>
            <th className="w-36 border-b border-zinc-200 p-4 text-sm text-zinc-500">Product</th>
            {compare.map(product => (
              <th key={product.id} className="border-b border-l border-zinc-200 p-4 align-top">
                <div className="relative">
                  <button
                    onClick={() => toggleCompare(product)}
                    aria-label={`Remove ${product.name} from comparison`}
                    className="absolute right-0 top-0 rounded-full bg-zinc-100 p-2 hover:bg-rose-100 hover:text-rose-700"
                  ><X size={16} /></button>
                  <Link to={`/product/${product.slug}`}>
                    <img src={getProductImage(product, 500)} alt={product.name} className="mb-4 aspect-[4/3] w-full rounded-2xl object-cover" />
                    <span className="pr-8 font-bold text-zinc-950">{product.name}</span>
                  </Link>
                </div>
                <button
                  onClick={() => addToCart(product, product.sizes?.[0] || "", product.colors?.[0] || "")}
                  disabled={product.stock === 0}
                  className="mt-4 w-full rounded-xl bg-zinc-950 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                >{product.stock ? "Add to cart" : "Out of stock"}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map(row => (
            <tr key={row.label} className="odd:bg-zinc-50">
              <th scope="row" className="border-b border-zinc-200 p-4 text-sm font-semibold text-zinc-600">{row.label}</th>
              {compare.map(product => (
                <td key={product.id} className="border-b border-l border-zinc-200 p-4 text-sm">{row.value(product)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </main>
}
