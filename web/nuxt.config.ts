export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['bootstrap/dist/css/bootstrap.min.css', 'bootstrap-icons/font/bootstrap-icons.min.css', '~/assets/app.css'],
  runtimeConfig: {
    apiBase: 'http://localhost:3001',
    apiToken: '',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Lista de tareas',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
});
