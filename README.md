# NNTPUD-BUOI6

NguyenLeXuanDang 2280600671

## Authentication (JWT RS256)

Project da chuyen tu HMAC secret sang RSA 2048 (`RS256`) voi 2 file:

- `privateKey.pem`: dung de ky token o API login
- `publicKey.pem`: dung de xac thuc token o middleware `CheckLogin`

## API lien quan

### 1) POST `/api/v1/auth/login`

Body:

```json
{
  "username": "admin",
  "password": "123"
}
```

Ket qua: tra ve JWT token (han 1 ngay).

### 2) GET `/api/v1/auth/me`

Header:

```text
Authorization: Bearer <token>
```

Ket qua: tra thong tin user dang dang nhap (khong tra truong `password`).

### 3) POST `/api/v1/auth/changepassword` (yeu cau dang nhap)

Header:

```text
Authorization: Bearer <token>
```

Body:

```json
{
  "oldpassword": "OldPass@123",
  "newpassword": "NewPass@123"
}
```

Dieu kien `newpassword`:

- toi thieu 8 ky tu
- co it nhat 1 chu hoa
- co it nhat 1 chu thuong
- co it nhat 1 so
- co it nhat 1 ky tu dac biet
