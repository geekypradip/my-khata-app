export type TransactionType = 'given' | 'received';

export type Person = {
  id: string;
  name: string;
  phoneNumber?: string;
  isExpenseCategory?: boolean;
  createdAt: string;
};

export type KhataTransaction = {
  id: string;
  personId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  date: string;
  createdAt: string;
};

export type AppData = {
  persons: Person[];
  transactions: KhataTransaction[];
  settings?: {
    reportOwnerName?: string;
  };
};

export type PersonTransactionImportMode = 'merge' | 'replace';

export type PersonTransactionImportItem = {
  type: TransactionType;
  amount: number;
  note?: string;
  date: string;
};

export type AppDataContextValue = {
  data: AppData;
  isLoading: boolean;
  addPerson: (input: { name: string; phoneNumber?: string; isExpenseCategory?: boolean }) => Promise<Person>;
  updatePerson: (
    personId: string,
    updates: { name: string; phoneNumber?: string; isExpenseCategory?: boolean }
  ) => Promise<void>;
  deletePerson: (personId: string) => Promise<void>;
  addTransaction: (input: {
    personId: string;
    type: TransactionType;
    amount: number;
    note?: string;
    date: string;
  }) => Promise<KhataTransaction>;
  updateTransaction: (
    transactionId: string,
    updates: { type: TransactionType; amount: number; note?: string; date: string }
  ) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  importTransactionsForPerson: (
    personId: string,
    mode: PersonTransactionImportMode
  ) => Promise<{ success: boolean; message: string }>;
  importTransactionsForPersonFromJson: (
    personId: string,
    rawJson: string,
    mode: PersonTransactionImportMode
  ) => Promise<{ success: boolean; message: string }>;
  sharePersonReport: (
    personId: string
  ) => Promise<{ success: boolean; message: string }>;
  updateReportOwnerName: (
    value: string
  ) => Promise<void>;
  downloadTransactionImportExample: (
    personName: string
  ) => Promise<{ success: boolean; message: string }>;
  exportBackup: () => Promise<{ success: boolean; message: string }>;
  importBackup: () => Promise<{ success: boolean; message: string }>;
  reload: () => Promise<void>;
};
