def test_order_flow(client, auth_headers):
    product = client.post(
        "/api/v1/products",
        json={
            "sku": "SKU-ORD",
            "name": "Order Product",
            "category": "General",
            "price": 25.00,
            "cost_price": 10.00,
            "stock_quantity": 50,
        },
        headers=auth_headers,
    ).json()["data"]

    customer = client.post(
        "/api/v1/customers",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "address": "123 Main St",
            "city": "New York",
            "country": "USA",
        },
        headers=auth_headers,
    ).json()["data"]

    order = client.post(
        "/api/v1/orders",
        json={
            "customer_id": customer["id"],
            "items": [{"product_id": product["id"], "quantity": 5}],
        },
        headers=auth_headers,
    )
    assert order.status_code == 200
    assert order.json()["data"]["status"] == "CONFIRMED"

    product_after = client.get(f"/api/v1/products/{product['id']}", headers=auth_headers)
    assert product_after.json()["data"]["stock_quantity"] == 45

    order_id = order.json()["data"]["id"]
    cancel = client.post(f"/api/v1/orders/{order_id}/cancel", headers=auth_headers)
    assert cancel.status_code == 200
    assert cancel.json()["data"]["status"] == "CANCELLED"

    product_restored = client.get(f"/api/v1/products/{product['id']}", headers=auth_headers)
    assert product_restored.json()["data"]["stock_quantity"] == 50


def test_insufficient_stock(client, auth_headers):
    product = client.post(
        "/api/v1/products",
        json={
            "sku": "SKU-LOW",
            "name": "Low Stock",
            "category": "General",
            "price": 10.00,
            "cost_price": 5.00,
            "stock_quantity": 2,
        },
        headers=auth_headers,
    ).json()["data"]

    customer = client.post(
        "/api/v1/customers",
        json={
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@example.com",
            "phone": "+1987654321",
            "address": "456 Oak Ave",
            "city": "Boston",
            "country": "USA",
        },
        headers=auth_headers,
    ).json()["data"]

    res = client.post(
        "/api/v1/orders",
        json={
            "customer_id": customer["id"],
            "items": [{"product_id": product["id"], "quantity": 10}],
        },
        headers=auth_headers,
    )
    assert res.status_code == 400
