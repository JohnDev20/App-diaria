import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { DiaryData, parseBackup, toDateKey } from "./diary";
export async function exportBackup(data: DiaryData) {
  const content = JSON.stringify(data, null, 2),
    name = `minhas-diarias-${toDateKey()}.json`;
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  if (!(await Sharing.isAvailableAsync()))
    throw new Error(
      "O compartilhamento de arquivos não está disponível neste aparelho.",
    );
  const uri = FileSystem.cacheDirectory + name;
  await FileSystem.writeAsStringAsync(uri, content);
  await Sharing.shareAsync(uri, {
    mimeType: "application/json",
    dialogTitle: "Guardar backup das diárias",
    UTI: "public.json",
  });
}
export async function pickBackup(): Promise<DiaryData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "application/octet-stream"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (asset.size && asset.size > 10000000)
    throw new Error("O backup deve ter até 10 MB.");
  const text =
    Platform.OS === "web" && asset.file
      ? await asset.file.text()
      : await FileSystem.readAsStringAsync(asset.uri);
  try {
    return parseBackup(text);
  } catch (e) {
    throw new Error(`Backup inválido. ${e instanceof Error ? e.message : ""}`);
  }
}
