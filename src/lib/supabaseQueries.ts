import { supabase } from './supabase';

export interface GroupInput {
  name: string;
  description?: string;
  tax_rate?: number;
  service_rate?: number;
  discount_type?: 'fixed' | 'percent';
  discount_value?: number;
  extra_fee?: number;
}

export interface ExpenseInput {
  group_id: string;
  paid_by_member_id: string;
  title: string;
  amount: number;
}

// Group Queries
export async function createGroup(group: GroupInput) {
  const { data, error } = await supabase
    .from('groups')
    .insert([
      {
        name: group.name,
        description: group.description || null,
        tax_rate: group.tax_rate ?? 0,
        service_rate: group.service_rate ?? 0,
        discount_type: group.discount_type ?? 'fixed',
        discount_value: group.discount_value ?? 0,
        extra_fee: group.extra_fee ?? 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getGroupById(id: string) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateGroup(id: string, group: Partial<GroupInput>) {
  const { data, error } = await supabase
    .from('groups')
    .update(group)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Member Queries
export async function createMember(group_id: string, name: string) {
  const { data, error } = await supabase
    .from('members')
    .insert([{ group_id, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMembersByGroupId(group_id: string) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('group_id', group_id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function deleteMember(memberId: string) {
  // 1. Check if member paid for any expense
  const { data: paidExpenses, error: paidErr } = await supabase
    .from('expenses')
    .select('id, title')
    .eq('paid_by_member_id', memberId)
    .limit(1);

  if (paidErr) throw paidErr;
  if (paidExpenses && paidExpenses.length > 0) {
    throw new Error(`Anggota tidak dapat dihapus karena tercatat sebagai pembayar pada tagihan "${paidExpenses[0].title}".`);
  }

  // 2. Check if member participates in any expense
  const { data: participantIn, error: partErr } = await supabase
    .from('expense_participants')
    .select('id, expense_id')
    .eq('member_id', memberId)
    .limit(1);

  if (partErr) throw partErr;
  if (participantIn && participantIn.length > 0) {
    throw new Error('Anggota tidak dapat dihapus karena terdaftar sebagai penerima manfaat/penanggung pada tagihan.');
  }

  // 3. Safe to delete
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
  return true;
}

// Expense Queries
export async function createExpense(expense: ExpenseInput, participantIds: string[]) {
  // Insert expense row
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single();

  if (error) throw error;

  // Insert participants
  if (participantIds.length > 0) {
    const participantsData = participantIds.map((memberId) => ({
      expense_id: data.id,
      member_id: memberId,
    }));

    const { error: partError } = await supabase
      .from('expense_participants')
      .insert(participantsData);

    if (partError) {
      // Rollback expense if participant insertion fails
      await supabase.from('expenses').delete().eq('id', data.id);
      throw partError;
    }
  }

  return data;
}

export async function getExpensesByGroupId(group_id: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', group_id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function deleteExpense(expenseId: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
  return true;
}

// Aggregate Query
export async function getFullGroupData(groupId: string) {
  // 1. Fetch group details
  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupErr) throw groupErr;

  // 2. Fetch group members
  const { data: members, error: membersErr } = await supabase
    .from('members')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (membersErr) throw membersErr;

  // 3. Fetch group expenses
  const { data: expenses, error: expensesErr } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (expensesErr) throw expensesErr;

  // 4. Fetch all participants for these expenses
  const expenseIds = expenses.map((e) => e.id);
  let expenseParticipants: any[] = [];

  if (expenseIds.length > 0) {
    const { data: parts, error: partsErr } = await supabase
      .from('expense_participants')
      .select('*')
      .in('expense_id', expenseIds);

    if (partsErr) throw partsErr;
    expenseParticipants = parts;
  }

  // 5. Fetch receipt scans
  const { data: receiptScans, error: scansErr } = await supabase
    .from('receipt_scans')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  return {
    group,
    members,
    expenses,
    expenseParticipants,
    receiptScans: receiptScans || [],
  };
}
