import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DiaryData,
  DiaryRecord,
  DiarySettings,
  Payment,
  emptyData,
  makeDiaryRecord,
  toDateKey,
  upsertRecord,
  STORAGE_KEYS,
  validateData,
} from "./diary";
import { createWriter, loadData } from "./storage";
type Context = DiaryData & {
  loading: boolean;
  error: string;
  retry: () => void;
  saveSettings: (s: DiarySettings) => Promise<void>;
  addRecord: (
    r: DiaryRecord,
    replace?: boolean,
    originalDate?: string,
  ) => Promise<void>;
  deleteRecord: (date: string) => Promise<void>;
  markToday: () => Promise<void>;
  savePayment: (p: Payment) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  restore: (d: DiaryData) => Promise<void>;
  recover: (d?: DiaryData) => Promise<void>;
};
const DiaryContext = createContext<Context | null>(null);
export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(emptyData),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const writer = useRef<ReturnType<typeof createWriter> | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loadData(AsyncStorage)
      .then((d) => {
        if (active) {
          writer.current = createWriter(AsyncStorage, d, setData);
          setData(d);
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Não foi possível ler seus dados. Eles foram preservados. Tente novamente antes de fazer novos registros.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  async function update(fn: (d: DiaryData) => DiaryData) {
    if (!writer.current || loading || error)
      throw new Error("Aguarde o carregamento dos dados.");
    await writer.current(fn);
  }
  async function recover(next?: DiaryData) {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.data);
    const backup =
      next ??
      validateData(
        JSON.parse(
          (await AsyncStorage.getItem(STORAGE_KEYS.recovery)) ?? "null",
        ),
      );
    if (raw !== null)
      await AsyncStorage.setItem("@minhas-diarias/quarantine", raw);
    await AsyncStorage.setItem(
      STORAGE_KEYS.data,
      JSON.stringify(validateData(backup)),
    );
    setAttempt((n) => n + 1);
  }
  return (
    <DiaryContext.Provider
      value={{
        ...data,
        loading,
        error,
        recover,
        retry: () => setAttempt((n) => n + 1),
        saveSettings: (s) => update((d) => ({ ...d, settings: s })),
        addRecord: (r, replace = false, originalDate) =>
          update((d) =>
            upsertRecord(
              {
                ...d,
                records: originalDate
                  ? d.records.filter((item) => item.date !== originalDate)
                  : d.records,
              },
              r,
              replace,
            ),
          ),
        deleteRecord: (date) =>
          update((d) => ({
            ...d,
            records: d.records.filter((r) => r.date !== date),
          })),
        markToday: () =>
          update((d) =>
            d.records.some((r) => r.date === toDateKey())
              ? d
              : upsertRecord(
                  d,
                  makeDiaryRecord(toDateKey(), d.settings.defaultAmountCents),
                ),
          ),
        savePayment: (p) =>
          update((d) => ({
            ...d,
            payments: [...d.payments.filter((x) => x.id !== p.id), p],
          })),
        deletePayment: (id) =>
          update((d) => ({
            ...d,
            payments: d.payments.filter((p) => p.id !== id),
          })),
        restore: (next) => update(() => next),
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
}
export function useDiary() {
  const context = useContext(DiaryContext);
  if (!context) throw new Error("DiaryProvider ausente");
  return context;
}
