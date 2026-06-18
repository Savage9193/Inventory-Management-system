def test_create_and_list_products(client, auth_headers):
    res = client.post(
        "/api/v1/products",
        json={
            "sku": "SKU-001",
            "name": "Test Product",
            "description": "A test product",
            "category": "Electronics",
            "price": 99.99,
            "cost_price": 50.00,
            "stock_quantity": 100,
            "reorder_level": 10,
        },
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["data"]["sku"] == "SKU-001"

    res = client.get("/api/v1/products", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()["data"]) >= 1


def test_duplicate_sku(client, auth_headers):
    payload = {
        "sku": "SKU-DUP",
        "name": "Product 1",
        "category": "General",
        "price": 10.00,
        "cost_price": 5.00,
        "stock_quantity": 10,
    }
    client.post("/api/v1/products", json=payload, headers=auth_headers)
    res = client.post("/api/v1/products", json=payload, headers=auth_headers)
    assert res.status_code == 409


def test_soft_delete_product(client, auth_headers):
    create = client.post(
        "/api/v1/products",
        json={
            "sku": "SKU-DEL",
            "name": "Delete Me",
            "category": "General",
            "price": 15.00,
            "cost_price": 8.00,
            "stock_quantity": 5,
        },
        headers=auth_headers,
    )
    product_id = create.json()["data"]["id"]
    res = client.delete(f"/api/v1/products/{product_id}", headers=auth_headers)
    assert res.status_code == 200
