from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from store.models import Address, Category, Order, OrderItem, Product


class Command(BaseCommand):
    help = "Create the sample Fashion Zone catalog, customer addresses, and orders."

    def handle(self, *args, **options):
        categories = self.create_categories()
        products = self.create_products(categories)
        customer, created = User.objects.get_or_create(
            username="demo_customer",
            defaults={"email": "customer@fashionzone.test", "first_name": "Aarav", "last_name": "Sharma"},
        )
        if created:
            customer.set_password("demo12345")
            customer.save(update_fields=["password"])

        addresses = self.create_addresses(customer)
        self.create_orders(customer, addresses, products)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Category.objects.count()} categories, {Product.objects.count()} products, "
            f"{Address.objects.count()} addresses, and {Order.objects.count()} orders."
        ))

    def create_categories(self):
        category_data = [
            ("Clothing", "clothing"),
            ("Shoes", "shoes"),
            ("Accessories", "accessories"),
            ("Bags", "bags"),
        ]
        return {
            slug: Category.objects.update_or_create(
                slug=slug, defaults={"name": name}
            )[0]
            for name, slug in category_data
        }

    def create_products(self, categories):
        product_data = [
            ("linen-oversized-shirt", "Linen Oversized Shirt", "clothing", "A breathable linen shirt with a relaxed fit, curved hem, and button-down front for easy everyday styling.", "39.99", "49.99", ["S", "M", "L", "XL"], ["White", "Sage", "Black"], 32, True),
            ("essential-cotton-tee", "Essential Cotton T-Shirt", "clothing", "A soft heavyweight cotton tee with a clean crew neck and durable construction for daily wear.", "19.99", "24.99", ["S", "M", "L", "XL"], ["White", "Charcoal", "Navy"], 65, False),
            ("ribbed-knit-midi-dress", "Ribbed Knit Midi Dress", "clothing", "A comfortable ribbed midi dress with a flattering silhouette and stretch fabric that moves with you.", "54.99", "69.99", ["XS", "S", "M", "L"], ["Mocha", "Black", "Olive"], 18, True),
            ("utility-cargo-pants", "Utility Cargo Pants", "clothing", "Straight-leg cargo pants with adjustable hems and practical pocket storage in a lightweight cotton blend.", "44.99", None, ["S", "M", "L", "XL"], ["Khaki", "Black", "Stone"], 24, False),
            ("classic-court-sneakers", "Classic Court Sneakers", "shoes", "Low-profile everyday sneakers with a cushioned footbed, flexible rubber sole, and clean court-inspired design.", "64.99", "79.99", ["39", "40", "41", "42", "43", "44"], ["White", "Black"], 27, True),
            ("trail-runner-shoes", "Trail Runner Shoes", "shoes", "Lightweight trail runners with breathable mesh, reliable grip, and responsive cushioning for active days.", "89.99", "109.99", ["40", "41", "42", "43", "44"], ["Sand", "Green", "Black"], 16, False),
            ("leather-loafers", "Leather Loafers", "shoes", "Polished full-grain leather loafers with a supportive sole that works from office hours to dinner.", "99.99", None, ["39", "40", "41", "42", "43"], ["Brown", "Black"], 11, False),
            ("everyday-canvas-tote", "Everyday Canvas Tote", "bags", "A roomy canvas tote with an interior pocket and reinforced handles for work, errands, and weekend plans.", "29.99", "34.99", [], ["Natural", "Black", "Rust"], 40, True),
            ("structured-crossbody-bag", "Structured Crossbody Bag", "bags", "A compact structured crossbody with an adjustable strap, magnetic closure, and organized interior compartments.", "49.99", None, [], ["Tan", "Black", "Burgundy"], 21, False),
            ("minimal-leather-belt", "Minimal Leather Belt", "accessories", "A versatile genuine leather belt with a brushed metal buckle and five adjustment holes for a precise fit.", "24.99", None, ["S", "M", "L"], ["Black", "Tan"], 29, False),
            ("everyday-ribbed-cap", "Everyday Ribbed Cap", "accessories", "A soft ribbed cotton cap with an adjustable back strap and understated embroidered logo.", "17.99", None, [], ["Black", "Cream", "Forest"], 35, False),
            ("classic-square-sunglasses", "Classic Square Sunglasses", "accessories", "UV400 square-frame sunglasses with lightweight acetate arms and a subtle matte finish.", "22.99", "29.99", [], ["Tortoise", "Black"], 14, True),
        ]
        product_data.extend(self.generate_product_data())
        products = {}
        for data in product_data:
            slug, name, category_slug, description, price, old_price, sizes, colors, stock, featured = data
            product, _ = Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "category": categories[category_slug],
                    "name": name,
                    "description": description,
                    "price": Decimal(price),
                    "old_price": Decimal(old_price) if old_price else None,
                    "sizes": sizes,
                    "colors": colors,
                    "stock": stock,
                    "featured": featured,
                },
            )
            products[slug] = product
        return products

    def generate_product_data(self):
        catalog = {
            "clothing": {
                "names": ["Relaxed Oxford Shirt", "French Terry Hoodie", "Pleated Wide-Leg Trousers", "Satin Slip Skirt", "Cropped Denim Jacket", "Merino Cardigan", "Boxy Poplin Blouse", "Knit Polo Shirt", "Relaxed Linen Shorts", "Tailored Blazer"],
                "materials": ["organic cotton", "washed linen", "soft brushed fleece", "recycled viscose", "textured twill"],
                "colors": [["White", "Sky", "Navy"], ["Black", "Oat", "Rust"], ["Sage", "Cream", "Charcoal"]],
                "sizes": ["XS", "S", "M", "L", "XL"],
                "description": "A versatile {material} wardrobe piece with a comfortable fit, considered finishing, and easy styling for workdays or weekends.",
                "base_price": 34,
            },
            "shoes": {
                "names": ["Suede Street Trainers", "Leather Chelsea Boots", "Braided Slide Sandals", "Retro Running Shoes", "Block Heel Mules", "Canvas High-Tops", "Everyday Derby Shoes", "Cushioned Walking Shoes", "Woven Espadrilles", "Soft Leather Flats"],
                "materials": ["supple leather", "breathable mesh", "textured suede", "washed canvas", "woven textile"],
                "colors": [["White", "Grey", "Black"], ["Tan", "Brown", "Cream"], ["Olive", "Navy", "Black"]],
                "sizes": ["39", "40", "41", "42", "43", "44"],
                "description": "Comfort-focused {material} footwear with a supportive footbed, durable sole, and a clean shape made for all-day movement.",
                "base_price": 59,
            },
            "bags": {
                "names": ["Soft Hobo Bag", "Daily Laptop Tote", "Mini Top-Handle Bag", "Travel Weekender", "Quilted Shoulder Bag", "Convertible Backpack", "Nylon Belt Bag", "Leather Bucket Bag", "Packable Market Tote", "Woven Summer Bag"],
                "materials": ["full-grain leather", "heavyweight canvas", "water-resistant nylon", "woven raffia", "recycled polyester"],
                "colors": [["Black", "Tan", "Burgundy"], ["Natural", "Olive", "Navy"], ["Stone", "Rust", "Chocolate"]],
                "sizes": [],
                "description": "A practical {material} bag with a considered interior, secure closure, and comfortable carry options for everyday plans and travel.",
                "base_price": 39,
            },
            "accessories": {
                "names": ["Slim Chain Necklace", "Everyday Hoop Earrings", "Knotted Headband", "Canvas Watch Strap", "Brushed Metal Watch", "Soft Winter Scarf", "Layered Pendant Set", "Woven Bracelet", "Travel Jewelry Case", "Classic Hair Clip"],
                "materials": ["polished stainless steel", "soft cotton blend", "genuine leather", "recycled acetate", "brushed brass"],
                "colors": [["Gold", "Silver", "Rose Gold"], ["Black", "Cream", "Cobalt"], ["Tan", "Burgundy", "Forest"]],
                "sizes": [],
                "description": "A refined {material} accessory designed to add a useful finishing touch, with durable construction and an easy everyday feel.",
                "base_price": 16,
            },
        }
        generated = []
        for category_slug, details in catalog.items():
            for index in range(30):
                name = f"{details['names'][index % len(details['names'])]} {index // len(details['names']) + 1}"
                slug = f"{category_slug}-{index + 1:02d}-{name.lower().replace(' ', '-') }".replace("--", "-")
                material = details["materials"][index % len(details["materials"])]
                colors = details["colors"][index % len(details["colors"])]
                price = details["base_price"] + (index % 6) * 5 + (index % 3) * 0.99
                old_price = price + 10 if index % 3 == 0 else None
                sizes = details["sizes"] if details["sizes"] else []
                generated.append((
                    slug,
                    name,
                    category_slug,
                    details["description"].format(material=material),
                    f"{price:.2f}",
                    f"{old_price:.2f}" if old_price else None,
                    sizes,
                    colors,
                    10 + (index * 7) % 75,
                    index % 10 == 0,
                ))
        return generated

    def create_addresses(self, customer):
        address_data = [
            ("Aarav Sharma", "9800000001", "Kathmandu", "Lazimpat", "House 24, Ring Road"),
            ("Aarav Sharma", "9800000001", "Pokhara", "Lakeside", "Street 6, Apartment 3B"),
        ]
        addresses = []
        for full_name, phone, city, area, address_line in address_data:
            address, _ = Address.objects.update_or_create(
                user=customer,
                phone=phone,
                address_line=address_line,
                defaults={"full_name": full_name, "city": city, "area": area},
            )
            addresses.append(address)
        return addresses

    def create_orders(self, customer, addresses, products):
        order_data = [
            ("FZ-DEMO-001", addresses[0], "delivered", [("essential-cotton-tee", 2, "M", "White")]),
            ("FZ-DEMO-002", addresses[0], "shipped", [("classic-court-sneakers", 1, "42", "White"), ("minimal-leather-belt", 1, "M", "Black")]),
            ("FZ-DEMO-003", addresses[1], "processing", [("ribbed-knit-midi-dress", 1, "M", "Olive"), ("structured-crossbody-bag", 1, "", "Tan")]),
        ]
        for reference, address, status, item_data in order_data:
            order, _ = Order.objects.update_or_create(
                user=customer,
                payment_method=f"Cash on Delivery ({reference})",
                defaults={"address": address, "status": status, "total": Decimal("0.00")},
            )
            total = Decimal("0.00")
            for product_slug, quantity, size, color in item_data:
                product = products[product_slug]
                OrderItem.objects.update_or_create(
                    order=order,
                    product=product,
                    defaults={"quantity": quantity, "size": size, "color": color, "price": product.price},
                )
                total += product.price * quantity
            order.total = total
            order.save(update_fields=["total", "address", "status"])