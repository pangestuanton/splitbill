# API Contract Draft

Dokumen ini adalah draft jika SplitBill dikembangkan memakai database dan API route.

## POST /api/bills

Membuat bill baru.

Request:

```json
{
  "title": "Makan Sore",
  "note": "Nongkrong Jumat",
  "currency": "IDR"
}
```

Response:

```json
{
  "id": "bill_id",
  "shareId": "public_share_id"
}
```

## GET /api/bills/:id

Mengambil detail bill.

## PUT /api/bills/:id

Mengubah bill.

## GET /api/share/:shareId

Mengambil tampilan read-only untuk link publik.

## POST /api/bills/:id/calculate

Menghitung ulang split bill jika kalkulasi dilakukan server-side.
