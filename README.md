<h1 align="center">JakSabang Chatbot API</h1>

## Base URL

```bash
https://api-jaksabang-chatbot.vercel.app
```

## Chat Endpoint

Endpoint untuk berkomunikasi (chatting) dengan chatbot JakSabang.

- Method: `POST`
- Endpoint: `/`
- Headers:

```json
Authorization: Bearer <TOKEN>
```

- Request Body:

```json
{
    "message": "Apa makanan khas dari pulau Sabang?"
}
```

- Contoh output:

```json
{
    "status": 200,
    "response": "Selamat datang di Sabang! Pulau cantik di ujung utara Aceh ini memang memiliki kekayaan kuliner yang sangat beragam dan lezat. Salah satu makanan khas Sabang yang sangat populer adalah Sate Gurita...",
    "user": {
        "id": "6828c6d8f5a8fdc7eff2gf36",
        "role": "buyer",
        "iat": 1752267576,
        "exp": 1752173074
    }
}
```

## Status Codes

1. Status `200` (OK)
    Server berhasil memenuhi request.
2. Status `401` (Unauthorized)
    Request tidak berhasil karena tidak memiliki kredensial autentikasi yang valid.
3. Status `500` (Internal server error)
    Server mengalami kondisi tak terduga sehingga tidak bisa memenuhi request.