#!/bin/sh
set -e

API="${API_URL:-http://localhost:3000/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@meridian.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "🌱 Seeding Meridian demo data..."
echo "   API: $API"
echo ""

echo "🔑 Authenticating (retrying until services are ready)..."
TOKEN=""
i=0
while [ -z "$TOKEN" ] && [ $i -lt 30 ]; do
  i=$((i + 1))
  curl -s -X POST "$API/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"fullName\":\"Admin User\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"gender\":\"Male\"}" \
    -o /dev/null 2>/dev/null || true
  TOKEN=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | \
    grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  if [ -z "$TOKEN" ]; then
    sleep 2
  fi
done

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed after 30 retries. Check that services are running on $API"
  exit 1
fi
echo "   ✅ Token obtained (attempt $i)"

AUTH="Authorization: Bearer $TOKEN"

echo ""
echo "📂 Creating categories..."
for cat in Electronics Clothing "Home & Garden" Books "Sports & Outdoors"; do
  RESPONSE=$(curl -s -X POST "$API/categories" \
    -H "Content-Type: application/json" \
    -H "$AUTH" \
    -d "{\"name\":\"$cat\"}")
  ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -n "$ID" ]; then
    echo "$ID" > "/tmp/cat_$(echo "$cat" | tr ' &' '__')"
    echo "   ✅ $cat  →  $ID"
  else
    echo "   ⚠️  $cat  (may already exist)"
  fi
done

echo ""
echo "📦 Creating products..."

create_product() {
  name="$1" sku="$2" price="$3" stock="$4" cat_name="$5" desc="$6" img="$7"
  cat_id=$(cat "/tmp/cat_$(echo "$cat_name" | tr ' &' '__')" 2>/dev/null || echo "")

  payload="{\"name\":\"$name\",\"sku\":\"$sku\",\"price\":$price,\"stockQuantity\":$stock,\"description\":\"$desc\""
  if [ -n "$cat_id" ]; then 
    payload="$payload,\"categoryId\":\"$cat_id\""
  fi
  if [ -n "$img" ]; then
    payload="$payload,\"imageUrl\":\"$img\""
  fi
  payload="$payload}"

  curl -s -X POST "$API/products" \
    -H "Content-Type: application/json" \
    -H "$AUTH" \
    -d "$payload" \
    -o /dev/null -w "   → $name  (HTTP %{http_code})\n"
}

create_product \
  "Wireless Noise-Cancelling Headphones" \
  "ELEC-001" 249.99 45 "Electronics" \
  "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio." \
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"

create_product \
  "Smart Watch Pro" \
  "ELEC-002" 399.99 30 "Electronics" \
  "Advanced fitness tracking, GPS, heart rate monitor, and 7-day battery life in a sleek design." \
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"

create_product \
  "Bluetooth Portable Speaker" \
  "ELEC-003" 79.99 100 "Electronics" \
  "Waterproof portable speaker with 360° sound, 12-hour playtime, and built-in microphone." \
  "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop"

create_product \
  "USB-C Hub 7-in-1" \
  "ELEC-004" 49.99 200 "Electronics" \
  "Compact multi-port adapter with HDMI 4K, USB 3.0, SD card reader, and PD charging." \
  ""

create_product \
  "Classic Denim Jacket" \
  "CLTH-001" 89.99 60 "Clothing" \
  "Timeless denim jacket crafted from premium cotton. Perfect for layering in any season." \
  "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop"

create_product \
  "Merino Wool Sweater" \
  "CLTH-002" 129.99 35 "Clothing" \
  "Luxuriously soft merino wool sweater. Temperature-regulating and odor-resistant." \
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop"

create_product \
  "Running Shoes Ultra" \
  "CLTH-003" 159.99 50 "Clothing" \
  "Lightweight responsive cushioning with breathable mesh upper. Designed for peak performance." \
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"

create_product \
  "Canvas Backpack" \
  "CLTH-004" 59.99 80 "Clothing" \
  "Durable waxed canvas backpack with padded laptop compartment and leather accents." \
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"

create_product \
  "Ceramic Plant Pot Set" \
  "HOME-001" 34.99 120 "Home & Garden" \
  "Set of 3 handcrafted ceramic plant pots with drainage holes and bamboo trays." \
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop"

create_product \
  "Scented Soy Candle Trio" \
  "HOME-002" 44.99 90 "Home & Garden" \
  "Hand-poured soy candles in lavender, vanilla, and sandalwood. 40-hour burn time each." \
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=300&fit=crop"

create_product \
  "Bamboo Kitchen Utensil Set" \
  "HOME-003" 29.99 150 "Home & Garden" \
  "Eco-friendly bamboo utensils — spatula, spoon, tongs, and turner. Heat-resistant up to 400°F." \
  ""

create_product \
  "Fleece Throw Blanket" \
  "HOME-004" 39.99 75 "Home & Garden" \
  "Ultra-soft microfiber fleece throw. Machine washable, available in charcoal, navy, and cream." \
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"

create_product \
  "The Art of Clean Code" \
  "BOOK-001" 34.99 200 "Books" \
  "A practical guide to writing maintainable, readable, and efficient code. Covers patterns, refactoring, and best practices." \
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop"

create_product \
  "Designing Data-Intensive Apps" \
  "BOOK-002" 49.99 150 "Books" \
  "The definitive guide to building reliable, scalable, and maintainable data systems." \
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop"

create_product \
  "Yoga Mat Premium" \
  "SPRT-001" 69.99 65 "Sports & Outdoors" \
  "Extra-thick non-slip yoga mat with alignment lines. Includes carrying strap. 6mm thickness." \
  "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop"

create_product \
  "Insulated Water Bottle 32oz" \
  "SPRT-002" 34.99 180 "Sports & Outdoors" \
  "Double-wall vacuum insulated stainless steel. Keeps drinks cold 24h or hot 12h." \
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop"

create_product \
  "Resistance Band Set" \
  "SPRT-003" 24.99 250 "Sports & Outdoors" \
  "Set of 5 resistance bands with different tension levels. Includes door anchor and carrying bag." \
  ""

create_product \
  "Camping Hammock Double" \
  "SPRT-004" 54.99 40 "Sports & Outdoors" \
  "Two-person parachute hammock with tree straps. Supports up to 500 lbs. Packs to the size of a football." \
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop"

echo ""
echo "✅ Seeding complete!"
echo ""
echo "   Admin login:  $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo "   API:          $API"
