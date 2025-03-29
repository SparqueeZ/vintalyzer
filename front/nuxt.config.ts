// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true }
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  css: ["~/assets/styles.css"],
  app: {
    baseURL: "/", // Si tu utilises un sous-dossier, mets "/mon-site/"
  },

  components: {
    dirs: [
      "~/components/Login",
      "~/components",

      {
        extensions: ["vue"],
      },
    ],
  },
});
