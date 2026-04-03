import type {
  AppData,
  KhataTransaction,
  Person,
  PersonTransactionImportItem,
  TransactionType,
} from '@/types/app';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === 'string';
}

function isOptionalBoolean(value: unknown) {
  return value === undefined || typeof value === 'boolean';
}

function isValidDateString(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function isValidAmount(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === 'given' || value === 'received';
}

function isValidPerson(value: unknown): value is Person {
  return (
    isObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isOptionalString(value.phoneNumber) &&
    isOptionalBoolean(value.isExpenseCategory) &&
    isValidDateString(value.createdAt)
  );
}

function isValidTransaction(value: unknown): value is KhataTransaction {
  return (
    isObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.personId) &&
    isTransactionType(value.type) &&
    isValidAmount(value.amount) &&
    isOptionalString(value.note) &&
    isValidDateString(value.date) &&
    isValidDateString(value.createdAt)
  );
}

export function validateAppData(value: unknown): value is AppData {
  return (
    isObject(value) &&
    Array.isArray(value.persons) &&
    value.persons.every(isValidPerson) &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isValidTransaction) &&
    (value.settings === undefined ||
      (isObject(value.settings) && isOptionalString(value.settings.reportOwnerName)))
  );
}

export function parseImportedAppData(raw: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }

  if (!validateAppData(parsed)) {
    throw new Error('Backup file is missing required khata data.');
  }

  const personIds = new Set(parsed.persons.map((person) => person.id));
  const hasUnknownPerson = parsed.transactions.some((transaction) => !personIds.has(transaction.personId));

  if (hasUnknownPerson) {
    throw new Error('Backup file has transactions linked to unknown persons.');
  }

  return parsed;
}

function isValidPersonImportTransaction(value: unknown): value is PersonTransactionImportItem {
  return (
    isObject(value) &&
    isTransactionType(value.type) &&
    isValidAmount(value.amount) &&
    isOptionalString(value.note) &&
    isValidDateString(value.date)
  );
}

export function parseImportedPersonTransactions(raw: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Transaction file is not valid JSON.');
  }

  const transactions = Array.isArray(parsed)
    ? parsed
    : isObject(parsed) && Array.isArray(parsed.transactions)
      ? parsed.transactions
      : null;

  if (!transactions || !transactions.every(isValidPersonImportTransaction)) {
    throw new Error('Transaction file must contain a valid transactions array.');
  }

  return transactions;
}
