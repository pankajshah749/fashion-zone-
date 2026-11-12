import { createContext, useContext, useEffect, useMemo, useState } from "react"

const StoreContext = createContext()
export const useStore = () => useContext(StoreContext)

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("fz_cart") || "[]"))
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("fz_wishlist") || "[]"))

  useEffect(() => localStorage.setItem("fz_cart", JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem("fz_wishlist", JSON.stringify(wishlist)), [wishlist])

  const addToCart = (product, size = "", color = "") => {
    setCart(prev => {
      const existing = prev.find(x => x.id === product.id && x.size === size && x.color === color)
      if (existing) return prev.map(x => x === existing ? {...x, quantity: x.quantity + 1} : x)
      return [...prev, {...product, size, color, quantity: 1}]
    })
  }

  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index))
  const updateQuantity = (index, quantity) => setCart(prev => prev.map((x, i) => i === index ? {...x, quantity: Math.max(1, quantity)} : x))
  const toggleWishlist = (product) => setWishlist(prev => prev.some(x => x.id === product.id) ? prev.filter(x => x.id !== product.id) : [...prev, product])
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart])

  return <StoreContext.Provider value={{cart, wishlist, addToCart, removeFromCart, updateQuantity, toggleWishlist, cartCount, total}}>{children}</StoreContext.Provider>
}
