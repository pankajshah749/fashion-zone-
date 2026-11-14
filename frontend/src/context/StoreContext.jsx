import { createContext, useContext, useEffect, useMemo, useState } from "react"

const StoreContext = createContext()
export const useStore = () => useContext(StoreContext)

const readLocalStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readLocalStorage("fz_cart", []))
  const [wishlist, setWishlist] = useState(() => readLocalStorage("fz_wishlist", []))
  const [recentlyViewed, setRecentlyViewed] = useState(() => readLocalStorage("fz_recently_viewed", []))
  const [compare, setCompare] = useState(() => readLocalStorage("fz_compare", []))
  const [theme, setTheme] = useState(() => readLocalStorage("fz_theme", "light"))

  useEffect(() => localStorage.setItem("fz_cart", JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem("fz_wishlist", JSON.stringify(wishlist)), [wishlist])
  useEffect(() => localStorage.setItem("fz_recently_viewed", JSON.stringify(recentlyViewed)), [recentlyViewed])
  useEffect(() => localStorage.setItem("fz_compare", JSON.stringify(compare)), [compare])
  useEffect(() => {
    localStorage.setItem("fz_theme", JSON.stringify(theme))
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const addToCart = (product, size = "", color = "") => {
    setCart(prev => {
      const existing = prev.find(x => x.id === product.id && x.size === size && x.color === color)
      if (existing) return prev.map(x => x === existing ? { ...x, quantity: x.quantity + 1 } : x)
      return [...prev, { ...product, size, color, quantity: 1 }]
    })
  }

  const addRecentlyViewed = (product) => {
    if (!product) return
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== product.id)
      return [product, ...filtered].slice(0, 6)
    })
  }

  const toggleCompare = (product) => setCompare(prev => {
    if (prev.some(item => item.id === product.id)) {
      return prev.filter(item => item.id !== product.id)
    }
    if (prev.length >= 4) return prev
    return [...prev, product]
  })

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light")
  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index))
  const updateQuantity = (index, quantity) => setCart(prev => prev.map((x, i) => i === index ? { ...x, quantity: Math.max(1, quantity) } : x))
  const toggleWishlist = (product) => setWishlist(prev => prev.some(x => x.id === product.id) ? prev.filter(x => x.id !== product.id) : [...prev, product])
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart])

  return <StoreContext.Provider value={{ cart, wishlist, recentlyViewed, compare, theme, toggleTheme, addToCart, addRecentlyViewed, removeFromCart, updateQuantity, toggleWishlist, toggleCompare, cartCount, total }}>{children}</StoreContext.Provider>
}
