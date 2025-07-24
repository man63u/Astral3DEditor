<template>
  <div class="w-full h-full">
    <iframe
      :src="rocksiUrl"
      class="w-full h-full border-0"
      ref="rocksiIframe"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
const rocksiUrl = import.meta.env.VITE_ROCKSI_URL || '/rocksi/index.html'
</script>
