def test_register_and_login(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@test.com",
            "password": "password123",
            "full_name": "Test User",
            "role": "staff",
        },
    )
    assert res.status_code == 200
    assert res.json()["success"] is True

    res = client.post(
        "/api/v1/auth/login",
        json={"email": "user@test.com", "password": "password123"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()["data"]["tokens"]


def test_login_invalid_credentials(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@test.com", "password": "wrongpass"},
    )
    assert res.status_code == 401


def test_refresh_token(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh@test.com",
            "password": "password123",
            "full_name": "Refresh User",
            "role": "staff",
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "refresh@test.com", "password": "password123"},
    )
    refresh_token = login.json()["data"]["tokens"]["refresh_token"]
    res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    assert res.json()["data"]["access_token"]
