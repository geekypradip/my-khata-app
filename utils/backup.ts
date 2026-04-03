import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { AppData, PersonTransactionImportItem } from '@/types/app';
import { parseImportedAppData, parseImportedPersonTransactions } from '@/utils/validation';

export async function exportAppData(data: AppData) {
  const directory = FileSystem.cacheDirectory;

  if (!directory) {
    throw new Error('Unable to access local cache directory for backup export.');
  }

  const fileUri = `${directory}my-khata-backup-${new Date().toISOString()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Export khata backup',
    UTI: 'public.json',
  });
}

export async function importAppData() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return null;
  }

  const file = result.assets[0];
  const raw = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const parsed = parseImportedAppData(raw);

  return {
    persons: parsed.persons,
    transactions: parsed.transactions,
  };
}

export async function importPersonTransactionsData() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return null;
  }

  const file = result.assets[0];
  const raw = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return parseImportedPersonTransactions(raw);
}

export async function exportPersonTransactionsExample(personName: string) {
  const directory = FileSystem.cacheDirectory;

  if (!directory) {
    throw new Error('Unable to access local cache directory for example export.');
  }

  const exampleData: { personName: string; transactions: PersonTransactionImportItem[] } = {
    personName,
    transactions: [
      {
        type: 'given',
        amount: 500,
        note: 'Sample advance',
        date: '2026-04-01',
      },
      {
        type: 'received',
        amount: 150,
        note: 'Sample partial return',
        date: '2026-04-03',
      },
    ],
  };

  const fileUri = `${directory}transaction-import-example-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exampleData, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Download transaction import example',
    UTI: 'public.json',
  });
}
