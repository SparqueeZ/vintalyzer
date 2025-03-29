import { useTheme } from "~/composables/useTheme";

export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const { setTheme } = useTheme();
    setTheme("dark");
  }
});
