import { z } from 'zod';

export const participantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Nama peserta wajib diisi'),
});

export const billItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Nama item wajib diisi'),
  price: z.number().positive('Harga harus lebih dari 0'),
  quantity: z.number().int().min(1, 'Jumlah minimal 1'),
  paidByParticipantId: z.string().min(1, 'Pembayar wajib dipilih'),
  splitParticipantIds: z.array(z.string()).min(1, 'Minimal pilih 1 penanggung'),
});

export const splitBillSchema = z.object({
  participants: z.array(participantSchema).min(2, 'Minimal 2 peserta'),
  items: z.array(billItemSchema).min(1, 'Minimal 1 item'),
  taxRate: z.number().min(0),
  serviceRate: z.number().min(0),
  discountType: z.enum(['fixed', 'percent']),
  discountValue: z.number().min(0),
  extraFee: z.number().min(0),
});
