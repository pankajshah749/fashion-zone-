import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Star } from "lucide-react"
import api from "../api"
import { useStore } from "../context/StoreContext"
import ProductCard from "../components/ProductCard"
import { getProductImage } from "../utils/productImage"

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" })
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const { addToCart, addRecentlyViewed } = useStore()

  const loadProduct = async () => {
    try {
      const productResponse = await api.get(`products/${slug}/`)
      const nextProduct = productResponse.data
      setProduct(nextProduct)
      setSize(nextProduct.sizes?.[0] || "")
      setColor(nextProduct.colors?.[0] || "")
      addRecentlyViewed(nextProduct)

      const relatedResponse = await api.get("products/")
      const similar = relatedResponse.data.filter(item => item.category === nextProduct.category && item.id !== nextProduct.id).slice(0, 4)
      setRelatedProducts(similar)

      const reviewsResponse = await api.get(`products/${slug}/reviews/`)
      setReviews(reviewsResponse.data)
    } catch {
      setProduct(null)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [slug])

  const submitReview = async e => {
    e.preventDefault()
    try {
      await api.post(`products/${slug}/reviews/`, reviewForm)
      setReviewForm({ rating: 5, title: "", comment: "" })
      loadProduct()
    } catch {
      alert("Please login before writing a review.")
    }
  }

  if (!product) return <div className="p-20 text-center">Loading...</div>

  const averageRating = product.average_rating || 0

  return <>
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="overflow-hidden rounded-3xl bg-zinc-100"><img src={getProductImage(product, 1000)} className="h-[620px] w-full object-cover" alt={product.name} /></div>
      <div className="py-4">
        <p className="text-sm font-bold uppercase tracking-widest text-rose-600">{product.category_name}</p>
        <h1 className="mt-2 text-4xl font-black">{product.name}</h1>

        <div className="mt-5 flex items-center gap-2 text-amber-500">
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} size={18} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} />
          ))}
          <span className="ml-2 text-sm font-semibold text-zinc-600">{averageRating.toFixed(1)} · {product.review_count || 0} reviews</span>
        </div>

        <div className="mt-5 text-2xl font-bold">Rs. {product.price}</div>
        <p className="mt-6 leading-7 text-zinc-600">{product.description}</p>
        {product.sizes?.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 font-bold">Size</h3>
            <div className="flex gap-2">{product.sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`rounded-lg border px-4 py-2 ${size === s ? "border-black bg-black text-white" : ""}`}>{s}</button>)}</div>
          </div>
        )}
        {product.colors?.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-bold">Color</h3>
            <div className="flex flex-wrap gap-2">{product.colors.map(c => <button key={c} onClick={() => setColor(c)} className={`rounded-lg border px-4 py-2 ${color === c ? "border-black bg-black text-white" : ""}`}>{c}</button>)}</div>
          </div>
        )}
        <button onClick={() => addToCart(product, size, color)} className="mt-10 w-full rounded-xl bg-zinc-950 py-4 font-bold text-white transition hover:bg-rose-600">Add to Cart</button>
      </div>
    </main>

    <section className="mx-auto max-w-6xl px-4 pb-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black">Customer reviews</h3>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            {reviews.length ? reviews.map(review => (
              <div key={review.id} className="rounded-2xl bg-zinc-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{review.title || "Verified review"}</p>
                    <p className="text-sm text-zinc-500">By {review.user_name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">{[1,2,3,4,5].map(star => <Star key={star} size={15} fill={star <= review.rating ? "currentColor" : "none"} />)}</div>
                </div>
                <p className="mt-3 text-zinc-600">{review.comment}</p>
              </div>
            )) : <p className="text-zinc-500">No reviews yet. Be the first to review this product.</p>}
          </div>

          <form onSubmit={submitReview} className="space-y-3 rounded-2xl bg-zinc-50 p-4">
            <h4 className="text-lg font-black">Write a review</h4>
            <div>
              <label className="mb-2 block text-sm font-semibold">Rating</label>
              <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 bg-white p-3">
                {[5,4,3,2,1].map(value => <option key={value} value={value}>{value} stars</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Title</label>
              <input value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="What stood out?" className="w-full rounded-xl border border-zinc-200 bg-white p-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Review</label>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={5} placeholder="Tell us about your fit, quality, and styling experience." className="w-full rounded-xl border border-zinc-200 bg-white p-3" />
            </div>
            <button className="w-full rounded-xl bg-zinc-950 py-3 font-bold text-white">Submit review</button>
          </form>
        </div>
      </div>
    </section>

    {relatedProducts.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose-600">Complete the look</p>
            <h2 className="text-3xl font-black">You may also like</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {relatedProducts.map(item => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    )}
  </>
}
