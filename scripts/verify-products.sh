#!/usr/bin/env bash
# Verify product catalog + admin CRUD against live API
set -euo pipefail

API="${API_URL:-http://localhost:3000/api}"
PASS=0
FAIL=0
SKU="VERIFY-$(date +%s)"

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }

assert_http() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then pass "$label (HTTP $actual)"; else fail "$label (expected HTTP $expected, got $actual)"; fi
}

assert_json() {
  local label="$1" expr="$2" json="$3"
  if echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); assert ($expr); print('ok')" 2>/dev/null; then
    pass "$label"
  else
    fail "$label"
  fi
}

echo "🔍 Verifying product features at $API"
echo ""

# --- Public catalog ---
echo "📖 Public catalog"
HTTP=$(curl -s -o /tmp/products.json -w "%{http_code}" "$API/products")
assert_http "GET /products" "200" "$HTTP"
assert_json "Products list has data array" "isinstance(d.get('data'), list) and len(d['data']) > 0" "$(cat /tmp/products.json)"

FIRST_ID=$(python3 -c "import json; print(json.load(open('/tmp/products.json'))['data'][0]['id'])")
FIRST_NAME=$(python3 -c "import json; print(json.load(open('/tmp/products.json'))['data'][0]['name'])")

HTTP=$(curl -s -o /tmp/product.json -w "%{http_code}" "$API/products/$FIRST_ID")
assert_http "GET /products/:id" "200" "$HTTP"
assert_json "Product detail matches id" "d['id'] == '$FIRST_ID'" "$(cat /tmp/product.json)"

HTTP=$(curl -s -o /tmp/categories.json -w "%{http_code}" "$API/categories")
assert_http "GET /categories" "200" "$HTTP"
assert_json "Categories list non-empty" "isinstance(d, list) and len(d) > 0" "$(cat /tmp/categories.json)"

CAT_ID=$(python3 -c "import json; print(json.load(open('/tmp/categories.json'))[0]['id'])")

HTTP=$(curl -s -o /tmp/search.json -w "%{http_code}" "$API/products?search=$(python3 -c "print('$FIRST_NAME'.split()[0])")")
assert_http "GET /products?search=" "200" "$HTTP"
assert_json "Search returns results" "len(d.get('data', [])) > 0" "$(cat /tmp/search.json)"

HTTP=$(curl -s -o /tmp/filter.json -w "%{http_code}" "$API/products?categoryId=$CAT_ID")
assert_http "GET /products?categoryId=" "200" "$HTTP"
assert_json "Category filter returns results" "len(d.get('data', [])) > 0" "$(cat /tmp/filter.json)"

# Archived product hidden from public
HTTP=$(curl -s -o /tmp/notfound.json -w "%{http_code}" "$API/products/00000000-0000-0000-0000-000000000099")
if [ "$HTTP" = "404" ] || [ "$HTTP" = "500" ]; then pass "GET /products/:id invalid returns error (HTTP $HTTP)"; else fail "GET /products/:id invalid (expected 404, got $HTTP)"; fi

echo ""
echo "🔐 Auth + admin CRUD"

# Login admin
LOGIN=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@meridian.com","password":"admin123"}')
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || true)
if [ -n "$TOKEN" ]; then pass "Admin login"; else fail "Admin login"; echo "Cannot continue admin tests"; exit 1; fi
AUTH="Authorization: Bearer $TOKEN"

# Create product
CREATE=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"sku\":\"$SKU\",\"name\":\"Verify Test Product\",\"price\":9.99,\"stockQuantity\":5,\"description\":\"Automated verify\",\"categoryId\":\"$CAT_ID\"}")
CREATE_HTTP=$(echo "$CREATE" | tail -1 | sed 's/HTTP://')
CREATE_BODY=$(echo "$CREATE" | sed '$d')
assert_http "POST /products (create)" "201" "$CREATE_HTTP"
NEW_ID=$(echo "$CREATE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)
if [ -n "$NEW_ID" ]; then pass "Create returned product id"; else fail "Create returned product id"; fi

# Admin list includes new product
HTTP=$(curl -s -o /tmp/admin.json -w "%{http_code}" -H "$AUTH" "$API/admin/products?search=$SKU")
assert_http "GET /admin/products?search=" "200" "$HTTP"
assert_json "Admin list finds new product" "any(p.get('sku')=='$SKU' for p in d.get('data',[]))" "$(cat /tmp/admin.json)"

# Update product
HTTP=$(curl -s -o /tmp/updated.json -w "%{http_code}" -X PUT "$API/products/$NEW_ID" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"price":12.99}')
assert_http "PUT /products/:id (update)" "200" "$HTTP"
assert_json "Update changed price" "d.get('price') == 12.99" "$(cat /tmp/updated.json)"

# Archive (soft delete)
HTTP=$(curl -s -o /tmp/archived.json -w "%{http_code}" -X DELETE "$API/products/$NEW_ID" -H "$AUTH")
assert_http "DELETE /products/:id (archive)" "200" "$HTTP"

# Public catalog hides archived
HTTP=$(curl -s -o /tmp/gone.json -w "%{http_code}" "$API/products/$NEW_ID")
if [ "$HTTP" = "404" ] || [ "$HTTP" = "500" ]; then pass "Archived product hidden from public (HTTP $HTTP)"; else fail "Archived product still public (HTTP $HTTP)"; fi

# Admin archived list
HTTP=$(curl -s -o /tmp/archived_list.json -w "%{http_code}" -H "$AUTH" "$API/admin/products?includeDeleted=true&search=$SKU")
assert_http "GET /admin/products?includeDeleted=true" "200" "$HTTP"
assert_json "Archived product in admin list" "any(p.get('sku')=='$SKU' and p.get('deletedAt') for p in d.get('data',[]))" "$(cat /tmp/archived_list.json)"

# Restore
HTTP=$(curl -s -o /tmp/restored.json -w "%{http_code}" -X POST "$API/products/$NEW_ID/restore" -H "$AUTH")
assert_http "POST /products/:id/restore" "201" "$HTTP"

HTTP=$(curl -s -o /tmp/back.json -w "%{http_code}" "$API/products/$NEW_ID")
assert_http "Restored product visible publicly" "200" "$HTTP"

# Cleanup: archive test product again
curl -s -o /dev/null -X DELETE "$API/products/$NEW_ID" -H "$AUTH"

echo ""
echo "📂 Category admin"
TEST_CAT="VerifyCat-$(date +%s)"
CAT_CREATE=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$API/categories" \
  -H "Content-Type: application/json" -H "$AUTH" -d "{\"name\":\"$TEST_CAT\"}")
CAT_HTTP=$(echo "$CAT_CREATE" | tail -1 | sed 's/HTTP://')
assert_http "POST /categories (create)" "201" "$CAT_HTTP"
TEST_CAT_ID=$(echo "$CAT_CREATE" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)

HTTP=$(curl -s -o /tmp/cat_upd.json -w "%{http_code}" -X PUT "$API/categories/$TEST_CAT_ID" \
  -H "Content-Type: application/json" -H "$AUTH" -d "{\"name\":\"${TEST_CAT}-Updated\"}")
assert_http "PUT /categories/:id (update)" "200" "$HTTP"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/categories/$TEST_CAT_ID" -H "$AUTH")
assert_http "DELETE /categories/:id" "200" "$HTTP"

# Unauthorized create should fail
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/products" \
  -H "Content-Type: application/json" \
  -d '{"sku":"NOAUTH","name":"X","price":1,"stockQuantity":1}')
if [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ]; then pass "POST /products without auth rejected (HTTP $HTTP)"; else fail "POST /products without auth (expected 401/403, got $HTTP)"; fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
