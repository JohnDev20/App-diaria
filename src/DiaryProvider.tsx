import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  DiaryRecord,
  DiarySettings,
  STORAGE_KEYS,
  toDateKey,
  makeDiaryRecord,
} from './diary';

type DiaryContextValue = {
  records: DiaryRecord[];
  settings: DiarySettings;
  loading: boolean;
  saveSettings: (next: Partial<DiarySettings>) => Promise<void>;
  markToday: () => Promise<{ record: DiaryRecord; alreadyMarked: boolean }>;
  addRecord: (record: DiaryRecord) => Promise<void>;
  getRecordForDate: (date: string) => DiaryRecord | undefined;
};

const DiaryContext = createContext<DiaryContextValue | undefined>(undefined);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<DiaryRecord[]>([]);
  const [settings, setSettings] = useState<DiarySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.records),
      AsyncStorage.getItem(STORAGE_KEYS.settings),
    ])
      .then(([storedRecords, storedSettings]) => {
        if (!active) return;
        if (storedRecords) {
          try {
            setRecords(JSON.parse(storedRecords));
          } catch {
            setRecords([]);
          }
        }
        if (storedSettings) {
          try {
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
          } catch {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persistRecords = useCallback(async (next: DiaryRecord[]) => {
    const ordered = [...next].sort((a, b) => b.date.localeCompare(a.date));
    setRecords(ordered);
    await AsyncStorage.setItem(STORAGE_KEYS.records, JSON.stringify(ordered));
  }, []);

  const saveSettings = useCallback(async (next: Partial<DiarySettings>) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(merged));
  }, [settings]);

  const addRecord = useCallback(async (record: DiaryRecord) => {
    const withoutDate = records.filter((item) => item.date !== record.date);
    await persistRecords([...withoutDate, record]);
  }, [persistRecords, records]);

  const markToday = useCallback(async () => {
    const date = toDateKey();
    const existing = records.find((item) => item.date === date);
    if (existing) return { record: existing, alreadyMarked: true };
    const record = makeDiaryRecord(date, settings.defaultAmount);
    await addRecord(record);
    return { record, alreadyMarked: false };
  }, [addRecord, records, settings.defaultAmount]);

  const getRecordForDate = useCallback(
    (date: string) => records.find((item) => item.date === date),
    [records],
  );

  const value = useMemo(
    () => ({ records, settings, loading, saveSettings, markToday, addRecord, getRecordForDate }),
    [records, settings, loading, saveSettings, markToday, addRecord, getRecordForDate],
  );

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const context = useContext(DiaryContext);
  if (!context) throw new Error('useDiary precisa estar dentro de DiaryProvider');
  return context;
}
