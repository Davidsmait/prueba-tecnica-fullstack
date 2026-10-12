<template>
  <div class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-dark bg-dark">
      <div class="container">
        <NuxtLink to="/" class="navbar-brand fw-semibold">Tareas</NuxtLink>
        <span class="navbar-text small d-none d-sm-inline">Nuxt 3 · Pinia · NestJS</span>
      </div>
    </nav>

    <main class="container py-4 flex-grow-1">
      <slot />
    </main>

    <footer class="border-top py-3 text-center text-secondary small">
      Prueba técnica · Desarrollo Full Stack
    </footer>
  </div>
</template>
