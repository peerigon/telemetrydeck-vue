<script setup lang="ts">
  import { useTelemetryDeck } from './hooks';
  const { signal, setClientUser } = useTelemetryDeck();

  const changeClientUserClick = () => {
    setClientUser('user' + Math.floor(Math.random() * 1000));
  };

  const buttonSignalClick = () => {
    signal('example_event_name', {
      custom_data: 'other_data',
      timestamp: new Date().toISOString(),
    });
  };
  const buttonQueueClick = () => {
    signal('example_event_name', {
      custom_data: 'other_data',
      timestamp: new Date().toISOString(),
    });
  };
</script>
<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <button @click="buttonSignalClick">Log a click with signal</button>
    <button @click="buttonQueueClick">Log a click with queue</button>
    <button @click="changeClientUserClick">Change user</button>
  </div>
  
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
