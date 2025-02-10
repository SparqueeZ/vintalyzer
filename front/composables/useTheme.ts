import { ref, watchEffect } from "vue";

export const useTheme = () => {
  const currentTheme = ref("light");

  // Charger le thème depuis le localStorage ou définir par défaut
  if (import.meta.client) {
    const savedTheme = localStorage.getItem("theme") || "light";
    currentTheme.value = savedTheme;
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  if (import.meta.client) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (!localStorage.getItem("theme")) {
      currentTheme.value = prefersDark ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", currentTheme.value);
    }
  }

  const toggleTheme = () => {
    console.log("toggle theme");
    currentTheme.value = currentTheme.value === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme.value);
    if (process.client) {
      localStorage.setItem("theme", currentTheme.value);
    }
  };

  const setTheme = (theme: string) => {
    currentTheme.value = theme;
    document.documentElement.setAttribute("data-theme", theme);
    console.log("set theme", theme);
    if (process.client) {
      localStorage.setItem("theme", theme);
    }
  };

  return { currentTheme, toggleTheme, setTheme };
};
