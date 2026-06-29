import urllib.request
import json
import sys

API = "http://localhost:3000/api"

def req(method, path, data=None, token=None):
    url = f"{API}{path}"
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r)
        return json.loads(resp.read())
    except urllib.request.HTTPError as e:
        print(f"  HTTP {e.code}: {path}")
        return None

print("Logging in as admin...")
r = req("POST", "/auth/login", {"email": "admin@meridian.com", "password": "admin123"})
if not r or "access_token" not in r:
    print("Login failed, trying to register admin first...")
    r = req("POST", "/auth/register", {"fullName": "Admin User", "email": "admin@meridian.com", "password": "admin123", "gender": "Male"})
    r = req("POST", "/auth/login", {"email": "admin@meridian.com", "password": "admin123"})
    if not r or "access_token" not in r:
        print("Failed to login as admin")
        sys.exit(1)

token = r["access_token"]
print("Token obtained")

categories = {
    "Electronics": [
        ("Wireless Noise-Cancelling Headphones", "ELEC-001", 249.99, 45, "Premium over-ear headphones", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"),
        ("Smart Watch Pro", "ELEC-002", 399.99, 30, "Advanced fitness tracking, GPS, heart rate monitor", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"),
        ("Bluetooth Portable Speaker", "ELEC-003", 79.99, 100, "Waterproof portable speaker", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop"),
        ("USB-C Hub 7-in-1", "ELEC-004", 49.99, 200, "Compact multi-port adapter", ""),
    ],
    "Clothing": [
        ("Classic Denim Jacket", "CLTH-001", 89.99, 60, "Timeless denim jacket", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop"),
        ("Merino Wool Sweater", "CLTH-002", 129.99, 35, "Luxuriously soft merino wool sweater", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop"),
        ("Running Shoes Ultra", "CLTH-003", 159.99, 50, "Lightweight responsive cushioning", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"),
        ("Canvas Backpack", "CLTH-004", 59.99, 80, "Durable waxed canvas backpack", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"),
    ],
    "Home & Garden": [
        ("Ceramic Plant Pot Set", "HOME-001", 34.99, 120, "Set of 3 handcrafted ceramic plant pots", "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop"),
        ("Scented Soy Candle Trio", "HOME-002", 44.99, 90, "Hand-poured soy candles", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=300&fit=crop"),
        ("Bamboo Kitchen Utensil Set", "HOME-003", 29.99, 150, "Eco-friendly bamboo utensils", ""),
        ("Fleece Throw Blanket", "HOME-004", 39.99, 75, "Ultra-soft microfiber fleece throw", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"),
    ],
    "Books": [
        ("The Art of Clean Code", "BOOK-001", 34.99, 200, "A practical guide to writing maintainable code", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop"),
        ("Designing Data-Intensive Apps", "BOOK-002", 49.99, 150, "The definitive guide to building reliable data systems", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop"),
    ],
    "Sports & Outdoors": [
        ("Yoga Mat Premium", "SPRT-001", 69.99, 65, "Extra-thick non-slip yoga mat", "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop"),
        ("Insulated Water Bottle 32oz", "SPRT-002", 34.99, 180, "Double-wall vacuum insulated stainless steel", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop"),
        ("Resistance Band Set", "SPRT-003", 24.99, 250, "Set of 5 resistance bands", ""),
        ("Camping Hammock Double", "SPRT-004", 54.99, 40, "Two-person parachute hammock", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop"),
    ],
}

print("Creating categories...")
cat_ids = {}
for cat_name in categories:
    r = req("POST", "/categories", {"name": cat_name}, token)
    if r and "id" in r:
        cat_ids[cat_name] = r["id"]
        print(f"  Created category: {cat_name}")
    else:
        print(f"  Failed category: {cat_name}")

print("Creating products...")
for cat_name, products in categories.items():
    cat_id = cat_ids.get(cat_name)
    if not cat_id:
        continue
    for name, sku, price, stock, desc, img in products:
        payload = {
            "name": name, "sku": sku, "price": price,
            "stockQuantity": stock, "description": desc,
            "categoryId": cat_id,
        }
        if img:
            payload["imageUrl"] = img
        r = req("POST", "/products", payload, token)
        if r:
            print(f"  Created: {name}")
        else:
            print(f"  Failed: {name}")

print("\nSeed complete!")
print("Admin login: admin@meridian.com / admin123")
