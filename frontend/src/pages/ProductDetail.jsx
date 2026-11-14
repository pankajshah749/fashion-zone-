import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeftRight, Star } from "lucide-react"
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
  const [activeImage, setActiveImage] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [alertEmail, setAlertEmail] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const { addToCart, addRecentlyViewed, compare, toggleCompare } = useStore()
  const comparing = compare.some(item => item.id === product?.id)
  const compareLimitReached = compare.length >= 4 && !comparing

  const loadProduct = async () => {
    try {
      const productResponse = await api.get(`products/${slug}/`)
      const nextProduct = productResponse.data
      setProduct(nextProduct)
      setSize(nextProduct.sizes?.[0] || "")
      setColor(nextProduct.colors?.[0] || "")
      setActiveImage(0)
      setZoomed(false)
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

  const submitStockAlert = async e => {
    e.preventDefault()
    setAlertMessage("")
    try {
      const response = await api.post(`products/${slug}/stock-alert/`, { email: alertEmail })
      setAlertMessage(response.data.detail)
      setAlertEmail("")
    } catch (error) {
      setAlertMessage(error.response?.data?.detail || error.response?.data?.email?.[0] || "Unable to save your alert. Please try again.")
    }
  }

  if (!product) return <div className="p-20 text-center">Loading...</div>

  const averageRating = product.average_rating || 0
  const productImages = [
    ...(product.image ? [{ id: "cover", image: product.image, alt_text: product.name }] : []),
    ...(product.gallery || []),
  ]
  if (!productImages.length) {
    productImages.push({ id: "fallback", image: getProductImage(product, 1000), alt_text: product.name })
  }
  const selectedImage = productImages[activeImage] || productImages[0]

  return <>
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div>
        <button
          type="button"
          onClick={() => setZoomed(value => !value)}
          className="group h-[420px] w-full cursor-zoom-in overflow-hidden rounded-3xl bg-zinc-100 md:h-[620px]"
          aria-label={zoomed ? "Zoom out of product image" : "Zoom in on product image"}
        >
          <img
            src={selectedImage.image}
            className={`h-full w-full object-cover transition-transform duration-300 ${zoomed ? "scale-125 cursor-zoom-out" : "group-hover:scale-105"}`}
            alt={selectedImage.alt_text || product.name}
          />
        </button>
        {productImages.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {productImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => { setActiveImage(index); setZoomed(false) }}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={activeImage === index}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${activeImage === index ? "border-rose-600" : "border-transparent"}`}
              >
                <img src={image.image} alt={image.alt_text || `${product.name} view ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
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
        {product.stock <= 5 && (
          <p className={`mt-3 text-sm font-bold ${product.stock === 0 ? "text-zinc-500" : "text-amber-700"}`}>
            {product.stock === 0 ? "Currently out of stock" : `Only ${product.stock} left in stock`}
          </p>
        )}
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
        <button onClick={() => addToCart(product, size, color)} disabled={product.stock === 0} className="mt-10 w-full rounded-xl bg-zinc-950 py-4 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-zinc-400">Add to Cart</button>
        <button
          onClick={() => toggleCompare(product)}
          disabled={compareLimitReached}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeftRight size={17} />
          {comparing ? "Remove from comparison" : compareLimitReached ? "Comparison limit reached" : "Add to comparison"}
        </button>
        {product.stock === 0 && (
          <form onSubmit={submitStockAlert} className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <label htmlFor="stock-alert-email" className="mb-2 block font-bold">Get notified when it’s back</label>
            <div className="flex gap-2">
              <input
                id="stock-alert-email"
                type="email"
                required
                value={alertEmail}
                onChange={event => setAlertEmail(event.target.value)}
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2"
              />
              <button className="rounded-xl bg-rose-600 px-4 font-bold text-white">Notify me</button>
            </div>
            {alertMessage && <p role="status" className="mt-2 text-sm text-zinc-600">{alertMessage}</p>}
          </form>
        )}
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
