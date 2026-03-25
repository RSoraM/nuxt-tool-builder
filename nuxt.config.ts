import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  devServer: {
    port: 30000
  },

  vite: {
    plugins: [tailwindcss()]
  },

  css: ['~/assets/css/tailwind.css']
})
