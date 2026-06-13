import type { ParticipantSummary, Settlement, SplitBillInput, SplitBillResult } from '@/types/splitbill';
import { roundRupiah } from './format';

export function calculateSplitBill(input: SplitBillInput): SplitBillResult {
  const { participants, items, taxRate, serviceRate, discountType, discountValue, extraFee } = input;

  const summaries = new Map<string, ParticipantSummary>();

  for (const participant of participants) {
    summaries.set(participant.id, {
      participantId: participant.id,
      name: participant.name,
      subtotal: 0,
      tax: 0,
      service: 0,
      discount: 0,
      extraFee: 0,
      totalOwed: 0,
      paid: 0,
      balance: 0,
    });
  }

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    const splitIds = item.splitParticipantIds.filter((id) => summaries.has(id));

    if (splitIds.length === 0) continue;

    const share = itemTotal / splitIds.length;

    for (const participantId of splitIds) {
      const summary = summaries.get(participantId);
      if (summary) summary.subtotal += share;
    }

    const payer = summaries.get(item.paidByParticipantId);
    if (payer) payer.paid += itemTotal;
  }

  const subtotal = Array.from(summaries.values()).reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * (taxRate / 100);
  const service = subtotal * (serviceRate / 100);
  const discount = discountType === 'percent' ? subtotal * (discountValue / 100) : discountValue;

  for (const summary of summaries.values()) {
    const ratio = subtotal > 0 ? summary.subtotal / subtotal : 0;
    summary.tax = tax * ratio;
    summary.service = service * ratio;
    summary.discount = discount * ratio;
    summary.extraFee = extraFee * ratio;
    summary.totalOwed = summary.subtotal + summary.tax + summary.service + summary.extraFee - summary.discount;
    summary.balance = summary.paid - summary.totalOwed;

    summary.subtotal = roundRupiah(summary.subtotal);
    summary.tax = roundRupiah(summary.tax);
    summary.service = roundRupiah(summary.service);
    summary.discount = roundRupiah(summary.discount);
    summary.extraFee = roundRupiah(summary.extraFee);
    summary.totalOwed = roundRupiah(summary.totalOwed);
    summary.paid = roundRupiah(summary.paid);
    summary.balance = roundRupiah(summary.balance);
  }

  const participantSummaries = Array.from(summaries.values());
  const settlements = createSettlements(participantSummaries);

  return {
    subtotal: roundRupiah(subtotal),
    tax: roundRupiah(tax),
    service: roundRupiah(service),
    discount: roundRupiah(discount),
    extraFee: roundRupiah(extraFee),
    total: roundRupiah(subtotal + tax + service + extraFee - discount),
    participants: participantSummaries,
    settlements,
  };
}

function createSettlements(participants: ParticipantSummary[]): Settlement[] {
  const debtors = participants
    .filter((participant) => participant.balance < 0)
    .map((participant) => ({ ...participant, amount: Math.abs(participant.balance) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = participants
    .filter((participant) => participant.balance > 0)
    .map((participant) => ({ ...participant, amount: participant.balance }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({
        fromParticipantId: debtor.participantId,
        fromName: debtor.name,
        toParticipantId: creditor.participantId,
        toName: creditor.name,
        amount: roundRupiah(amount),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.5) debtorIndex += 1;
    if (creditor.amount <= 0.5) creditorIndex += 1;
  }

  return settlements;
}
