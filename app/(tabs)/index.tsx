/**
 * ╔═══════════════════════════════════════════════════╗
 * ║           DompetKu — Expense Tracker              ║
 * ║         UTS Project | React Native + Expo         ║
 * ╚═══════════════════════════════════════════════════╝
 *
 * Theme   : Cyberpunk / Neon-Dark Glassmorphism
 * Fitur   : Saldo real-time, 2 tombol, FlatList,
 *           Conditional Styling, Validasi, KeyboardAvoidingView
 */

import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  // Background layers
  bg0: "#050711", // deepest bg
  bg1: "#0a0e1f", // card bg
  bg2: "#0f1530", // elevated card

  // Neon accents
  neonGreen: "#00f5a0",
  neonRed: "#ff4d6d",
  neonBlue: "#4d79ff",
  neonPurple: "#a855f7",

  // Soft tints (for backgrounds)
  greenDim: "rgba(0,245,160,0.08)",
  redDim: "rgba(255,77,109,0.08)",
  blueDim: "rgba(77,121,255,0.10)",
  purpleDim: "rgba(168,85,247,0.08)",

  // Text
  textPrimary: "#e8edff",
  textMuted: "#5a6488",
  textSub: "#8892b0",

  // Borders
  borderGlow: "rgba(77,121,255,0.25)",
  borderSub: "rgba(255,255,255,0.06)",
};

// ─── HELPER ─────────────────────────────────────────────────────────────────
const formatRupiah = (angka) => "Rp " + Math.abs(angka).toLocaleString("id-ID");

// ─── ANIMATED BUTTON ────────────────────────────────────────────────────────
function NeonButton({ label, onPress, color, dimColor }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.neonBtn,
          {
            backgroundColor: dimColor,
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.neonBtnTeks, { color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  // ── State ────────────────────────────────────────────────────────────────
  const [transaksi, setTransaksi] = useState([]);
  const [deskripsi, setDeskripsi] = useState("");
  const [nominal, setNominal] = useState("");

  // ── Kalkulasi saldo via reduce ───────────────────────────────────────────
  const totalSaldo = transaksi.reduce(
    (acc, t) => (t.tipe === "masuk" ? acc + t.nominal : acc - t.nominal),
    0,
  );
  const totalMasuk = transaksi
    .filter((t) => t.tipe === "masuk")
    .reduce((s, t) => s + t.nominal, 0);
  const totalKeluar = transaksi
    .filter((t) => t.tipe === "keluar")
    .reduce((s, t) => s + t.nominal, 0);

  // ── Tambah transaksi ─────────────────────────────────────────────────────
  const tambahTransaksi = (tipe) => {
    if (!deskripsi.trim()) {
      Alert.alert("⚠️ Input Kosong", "Deskripsi tidak boleh kosong!");
      return;
    }
    const nominalAngka = parseFloat(nominal);
    if (!nominal || isNaN(nominalAngka) || nominalAngka <= 0) {
      Alert.alert("⚠️ Nominal Invalid", "Masukkan angka lebih dari 0!");
      return;
    }

    const baru = {
      id: Date.now().toString(),
      ket: deskripsi.trim(),
      nominal: nominalAngka,
      tipe,
    };

    setTransaksi([baru, ...transaksi]);
    setDeskripsi("");
    setNominal("");
  };

  // ── Render item FlatList ─────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const isMasuk = item.tipe === "masuk";
    const warna = isMasuk ? C.neonGreen : C.neonRed;
    const bgWarna = isMasuk ? C.greenDim : C.redDim;

    return (
      <View style={[styles.itemCard, { borderLeftColor: warna }]}>
        {/* Glow dot */}
        <View
          style={[
            styles.itemDot,
            { backgroundColor: warna, shadowColor: warna },
          ]}
        />

        {/* Info */}
        <View style={styles.itemBody}>
          <Text style={styles.itemKet} numberOfLines={1}>
            {item.ket}
          </Text>
          <Text
            style={[
              styles.itemBadge,
              { color: warna, backgroundColor: bgWarna },
            ]}
          >
            {isMasuk ? "↑ PEMASUKAN" : "↓ PENGELUARAN"}
          </Text>
        </View>

        {/* Nominal — warna kondisional sesuai requirement */}
        <Text style={[styles.itemNominal, { color: warna }]}>
          {isMasuk ? "+" : "−"}
          {formatRupiah(item.nominal)}
        </Text>
      </View>
    );
  };

  // ── Empty State ──────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>🌌</Text>
      <Text style={styles.emptyTeks}>Belum ada transaksi</Text>
      <Text style={styles.emptySub}>
        Catat pemasukan atau pengeluaran pertamamu!
      </Text>
    </View>
  );

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg0} />

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ══ HEADER ══════════════════════════════════════════════════════ */}
        <View style={styles.header}>
          {/* App Title */}
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>
              DOMPET<Text style={styles.appTitleAccent}>KU</Text>
            </Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTeks}>LIVE</Text>
            </View>
          </View>

          {/* Saldo Utama */}
          <View style={styles.saldoWrap}>
            <Text style={styles.saldoLabel}>TOTAL SALDO</Text>
            <Text
              style={[
                styles.saldoAngka,
                { color: totalSaldo >= 0 ? C.neonGreen : C.neonRed },
              ]}
            >
              {totalSaldo < 0 ? "−" : ""}
              {formatRupiah(totalSaldo)}
            </Text>
            {/* Garis bawah neon */}
            <View
              style={[
                styles.saldoGaris,
                {
                  backgroundColor: totalSaldo >= 0 ? C.neonGreen : C.neonRed,
                },
              ]}
            />
          </View>

          {/* Kartu Masuk / Keluar */}
          <View style={styles.miniRow}>
            <View
              style={[
                styles.miniCard,
                { borderColor: C.neonGreen, backgroundColor: C.greenDim },
              ]}
            >
              <Text style={[styles.miniLabel, { color: C.neonGreen }]}>
                ↑ MASUK
              </Text>
              <Text style={[styles.miniNominal, { color: C.neonGreen }]}>
                {formatRupiah(totalMasuk)}
              </Text>
            </View>
            <View
              style={[
                styles.miniCard,
                { borderColor: C.neonRed, backgroundColor: C.redDim },
              ]}
            >
              <Text style={[styles.miniLabel, { color: C.neonRed }]}>
                ↓ KELUAR
              </Text>
              <Text style={[styles.miniNominal, { color: C.neonRed }]}>
                {formatRupiah(totalKeluar)}
              </Text>
            </View>
          </View>
        </View>

        {/* ══ FORM INPUT ══════════════════════════════════════════════════ */}
        <View style={styles.formCard}>
          <Text style={styles.formJudul}>// TAMBAH TRANSAKSI</Text>

          <TextInput
            style={styles.inputField}
            placeholder="Deskripsi  →  Beli Makan, Uang Bulanan..."
            placeholderTextColor={C.textMuted}
            value={deskripsi}
            onChangeText={setDeskripsi}
            returnKeyType="next"
            selectionColor={C.neonBlue}
          />

          <TextInput
            style={styles.inputField}
            placeholder="Nominal  →  50000"
            placeholderTextColor={C.textMuted}
            value={nominal}
            onChangeText={setNominal}
            keyboardType="numeric" // ← angka langsung
            returnKeyType="done"
            selectionColor={C.neonBlue}
          />

          {/* Tombol Pemasukan & Pengeluaran */}
          <View style={styles.btnRow}>
            <NeonButton
              label="↑  PEMASUKAN"
              onPress={() => tambahTransaksi("masuk")}
              color={C.neonGreen}
              dimColor={C.greenDim}
            />
            <NeonButton
              label="↓  PENGELUARAN"
              onPress={() => tambahTransaksi("keluar")}
              color={C.neonRed}
              dimColor={C.redDim}
            />
          </View>
        </View>

        {/* ══ RIWAYAT ═════════════════════════════════════════════════════ */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listJudul}>// RIWAYAT TRANSAKSI</Text>
          <Text style={styles.listCount}>{transaksi.length} data</Text>
        </View>

        <FlatList
          data={transaksi}
          keyExtractor={(item) => item.id} // ← keyExtractor wajib
          renderItem={renderItem}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg0 },
  root: { flex: 1 },

  // ── Header
  header: {
    backgroundColor: C.bg1,
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSub,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.textPrimary,
    letterSpacing: 4,
  },
  appTitleAccent: {
    color: C.neonBlue,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,245,160,0.10)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(0,245,160,0.3)",
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.neonGreen,
  },
  liveTeks: {
    color: C.neonGreen,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Saldo
  saldoWrap: { alignItems: "center", marginBottom: 18 },
  saldoLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 6,
  },
  saldoAngka: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 10,
  },
  saldoGaris: {
    width: 60,
    height: 2,
    borderRadius: 2,
    opacity: 0.7,
  },

  // Mini card
  miniRow: { flexDirection: "row", gap: 10 },
  miniCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
  },
  miniNominal: {
    fontSize: 13,
    fontWeight: "800",
  },

  // ── Form
  formCard: {
    margin: 16,
    backgroundColor: C.bg1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.borderGlow,
  },
  formJudul: {
    color: C.neonBlue,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  inputField: {
    backgroundColor: C.bg0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.borderSub,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.textPrimary,
    fontSize: 14,
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  neonBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  neonBtnTeks: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // ── List header
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  listJudul: {
    color: C.neonBlue,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  listCount: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // ── Item card
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg1,
    borderRadius: 14,
    marginBottom: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: C.borderSub,
    borderRightColor: C.borderSub,
    borderBottomColor: C.borderSub,
    gap: 10,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  itemBody: { flex: 1 },
  itemKet: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemBadge: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  itemNominal: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },

  // ── Empty
  emptyWrap: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTeks: {
    color: C.textSub,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySub: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
