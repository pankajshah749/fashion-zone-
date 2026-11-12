const productImages = {
  "linen-oversized-shirt": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  "essential-cotton-tee": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "ribbed-knit-midi-dress": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
  "utility-cargo-pants": "https://images.unsplash.com/photo-1506629905607-d9c297d7c8f2",
  "classic-court-sneakers": "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "trail-runner-shoes": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2",
  "leather-loafers": "https://images.unsplash.com/photo-1614252369475-531dbf2c8f02",
  "everyday-canvas-tote": "https://images.unsplash.com/photo-1544816155-12df9643f363",
  "structured-crossbody-bag": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "minimal-leather-belt": "https://images.unsplash.com/photo-1624222247344-550fb60583dc",
  "everyday-ribbed-cap": "https://images.unsplash.com/photo-1521369909029-2afed882baee",
  "classic-square-sunglasses": "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
}

const categoryImages = {
  clothing: [
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    "https://images.unsplash.com/photo-1543508282-6319a3e2621f",
    "https://images.unsplash.com/photo-1552346154-21d32810aba3",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
  ],
  bags: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
    "https://images.unsplash.com/photo-1594223274512-ad4803739b7c",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
    "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
  ],
}

export function getProductImage(product, width = 700) {
  if (product.image) return product.image
  const category = String(product.category_name || "").toLowerCase()
  const images = categoryImages[category] || categoryImages.clothing
  const imageIndex = [...String(product.slug || product.name)].reduce((total, character) => total + character.charCodeAt(0), 0) % images.length
  const image = productImages[product.slug] || images[imageIndex]
  return `${image}?auto=format&fit=crop&w=${width}&q=85`
}