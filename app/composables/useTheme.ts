import { useThemeStore } from "@/stores/theme";

export function useTheme() {
  const s = useThemeStore();
  onMounted(() => s.init());
  const isDark = computed(() => s.resolved === "dark");
  return {
    isDark,
    mode: computed(() => s.mode),
    setMode: s.setMode,
    toggle: () => s.setMode(isDark.value ? "light" : "dark"),
  };
}
