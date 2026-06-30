export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },
  compatibilityDate: "2025-01-01",
  typescript: {
    strict: true,
    typeCheck: false,
  },
  runtimeConfig: {
    public: {
      supabaseUrl: "",
      supabaseAnonKey: "",
    },
  },
  app: {
    head: {
      title: "WishForUS",
      meta: [
        {
          name: "description",
          content:
            "A private shared wishlist, to-do list, and bucket list app for couples.",
        },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
