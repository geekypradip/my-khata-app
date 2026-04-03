import React, { createContext, use, useEffect, useRef, useState } from 'react';

import type {
  AppData,
  AppDataContextValue,
  KhataTransaction,
  Person,
  PersonTransactionImportMode,
} from '@/types/app';
import { loadAppData, saveAppData } from '@/storage/app-storage';
import {
  exportAppData,
  exportPersonTransactionsExample,
  importAppData,
  importPersonTransactionsData,
} from '@/utils/backup';
import { createId } from '@/utils/id';
import { sharePersonReportPdf } from '@/utils/report';
import { sampleAppData } from '@/storage/sample-data';
import { parseImportedPersonTransactions } from '@/utils/validation';

const AppDataContext = createContext<AppDataContextValue | null>(null);

async function persistAndReturn(data: AppData) {
  await saveAppData(data);
  return data;
}

export function AppDataProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<AppData>(sampleAppData);
  const [isLoading, setIsLoading] = useState(true);
  const dataRef = useRef<AppData>(sampleAppData);

  const reload = async () => {
    setIsLoading(true);

    try {
      const nextData = await loadAppData();
      dataRef.current = nextData;
      setData(nextData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const updateData = async (updater: (current: AppData) => AppData) => {
    const nextData = updater(dataRef.current);
    dataRef.current = nextData;
    setData(nextData);
    await persistAndReturn(nextData);
    return nextData;
  };

  const addPerson = async (input: { name: string; phoneNumber?: string; isExpenseCategory?: boolean }) => {
    const person: Person = {
      id: createId('person'),
      name: input.name.trim(),
      phoneNumber: input.phoneNumber?.trim() || undefined,
      isExpenseCategory: input.isExpenseCategory || undefined,
      createdAt: new Date().toISOString(),
    };

    await updateData((current) => ({
      ...current,
      persons: [person, ...current.persons],
    }));

    return person;
  };

  const updatePerson = async (
    personId: string,
    updates: { name: string; phoneNumber?: string; isExpenseCategory?: boolean }
  ) => {
    await updateData((current) => ({
      ...current,
      persons: current.persons.map((person) =>
        person.id === personId
          ? {
              ...person,
              name: updates.name.trim(),
              phoneNumber: updates.phoneNumber?.trim() || undefined,
              isExpenseCategory:
                updates.isExpenseCategory === undefined
                  ? person.isExpenseCategory
                  : updates.isExpenseCategory || undefined,
            }
          : person
      ),
    }));
  };

  const deletePerson = async (personId: string) => {
    await updateData((current) => ({
      persons: current.persons.filter((person) => person.id !== personId),
      transactions: current.transactions.filter((transaction) => transaction.personId !== personId),
    }));
  };

  const addTransaction = async (input: {
    personId: string;
    type: 'given' | 'received';
    amount: number;
    note?: string;
    date: string;
  }) => {
    const transaction: KhataTransaction = {
      id: createId('txn'),
      personId: input.personId,
      type: input.type,
      amount: input.amount,
      note: input.note?.trim() || undefined,
      date: input.date,
      createdAt: new Date().toISOString(),
    };

    await updateData((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
    }));

    return transaction;
  };

  const updateTransaction = async (
    transactionId: string,
    updates: { type: 'given' | 'received'; amount: number; note?: string; date: string }
  ) => {
    await updateData((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              ...updates,
              note: updates.note?.trim() || undefined,
            }
          : transaction
      ),
    }));
  };

  const deleteTransaction = async (transactionId: string) => {
    await updateData((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== transactionId),
    }));
  };

  const updateReportOwnerName = async (value: string) => {
    await updateData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        reportOwnerName: value.trim() || undefined,
      },
    }));
  };

  const applyImportedTransactions = async (
    personId: string,
    mode: PersonTransactionImportMode,
    importedTransactions: Array<{
      type: 'given' | 'received';
      amount: number;
      note?: string;
      date: string;
    }>
  ) => {
    const normalizedTransactions = importedTransactions.map((transaction) => ({
      id: createId('txn'),
      personId,
      type: transaction.type,
      amount: transaction.amount,
      note: transaction.note?.trim() || undefined,
      date: transaction.date,
      createdAt: new Date().toISOString(),
    }));

    await updateData((current) => ({
      ...current,
      transactions:
        mode === 'replace'
          ? [
              ...current.transactions.filter((transaction) => transaction.personId !== personId),
              ...normalizedTransactions,
            ]
          : [...normalizedTransactions, ...current.transactions],
    }));
  };

  const importTransactionsForPerson = async (personId: string, mode: PersonTransactionImportMode) => {
    try {
      const importedTransactions = await importPersonTransactionsData();

      if (!importedTransactions) {
        return { success: false, message: 'Import cancelled.' };
      }

      await applyImportedTransactions(personId, mode, importedTransactions);

      return {
        success: true,
        message:
          mode === 'replace'
            ? 'Imported transactions and replaced this person\'s existing entries.'
            : 'Imported transactions and merged them with existing entries.',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unable to import transactions right now.',
      };
    }
  };

  const importTransactionsForPersonFromJson = async (
    personId: string,
    rawJson: string,
    mode: PersonTransactionImportMode
  ) => {
    try {
      const importedTransactions = parseImportedPersonTransactions(rawJson);
      await applyImportedTransactions(personId, mode, importedTransactions);

      return {
        success: true,
        message:
          mode === 'replace'
            ? 'Pasted JSON imported and replaced this person\'s existing entries.'
            : 'Pasted JSON imported and merged with existing entries.',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to import pasted JSON right now.',
      };
    }
  };

  const downloadTransactionImportExample = async (personName: string) => {
    try {
      await exportPersonTransactionsExample(personName);
      return { success: true, message: 'Example JSON opened in share options.' };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unable to create example JSON right now.',
      };
    }
  };

  const sharePersonReport = async (personId: string) => {
    try {
      const person = dataRef.current.persons.find((entry) => entry.id === personId);

      if (!person) {
        return { success: false, message: 'This record no longer exists.' };
      }

      const transactions = dataRef.current.transactions.filter(
        (transaction) => transaction.personId === personId
      );

      await sharePersonReportPdf(
        person,
        transactions,
        dataRef.current.settings?.reportOwnerName
      );

      return { success: true, message: 'PDF report opened in share options.' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to create PDF report right now.',
      };
    }
  };

  const handleExport = async () => {
    try {
      await exportAppData(data);
      return { success: true, message: 'Backup file prepared and opened in share options.' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to export backup right now.',
      };
    }
  };

  const handleImport = async () => {
    try {
      const imported = await importAppData();

      if (!imported) {
        return { success: false, message: 'Import cancelled.' };
      }

      setData(imported);
      dataRef.current = imported;
      await saveAppData(imported);

      return { success: true, message: 'Backup restored successfully.' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to restore backup right now.',
      };
    }
  };

  return (
    <AppDataContext
      value={{
        data,
        isLoading,
        addPerson,
        updatePerson,
        deletePerson,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactionsForPerson,
        importTransactionsForPersonFromJson,
        sharePersonReport,
        updateReportOwnerName,
        downloadTransactionImportExample,
        exportBackup: handleExport,
        importBackup: handleImport,
        reload,
      }}>
      {children}
    </AppDataContext>
  );
}

export function useAppData() {
  const context = use(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider.');
  }

  return context;
}
