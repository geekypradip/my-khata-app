import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppData } from '@/types/app';
import { sampleAppData } from '@/storage/sample-data';
import { validateAppData } from '@/utils/validation';

const APP_STORAGE_KEY = 'my-khata-app:data';

function normalizeAppData(data: AppData): AppData {
  return {
    persons: data.persons,
    transactions: data.transactions,
    settings: {
      reportOwnerName: data.settings?.reportOwnerName ?? sampleAppData.settings?.reportOwnerName,
    },
  };
}

export async function loadAppData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(APP_STORAGE_KEY);

  if (!raw) {
    await saveAppData(sampleAppData);
    return sampleAppData;
  }

  try {
    const parsed = JSON.parse(raw);

    if (validateAppData(parsed)) {
      return normalizeAppData(parsed);
    }
  } catch {
    // Fall back to the initial dataset if corrupted local data is found.
  }

  const normalizedSample = normalizeAppData(sampleAppData);
  await saveAppData(normalizedSample);
  return normalizedSample;
}

export async function saveAppData(data: AppData) {
  await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(normalizeAppData(data)));
}

export async function clearAppData() {
  await AsyncStorage.removeItem(APP_STORAGE_KEY);
}
