<template>
  <div class="bg-base-300 p-4 w-full min-h-screen">
    <NuxtRouteAnnouncer />

    <section class="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      <Navbar />
      <main class="flex flex-col gap-4 w-full">
        <NuxtPage />
      </main>
    </section>
  </div>
</template>
