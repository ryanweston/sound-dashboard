<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

let files = ref([]);
let notes = ref(['C4', 'F4'])

const props = defineProps({
  setActiveSound: Function,
  activeSound: String
})

onMounted(async () => {
  const res = await axios.get('http://localhost:8080/files')
  files.value = res.data
  console.log(props.activeSound)
});

</script>

<template>
  <h2 class="text-lg">Uploaded sounds</h2>
  <div v-if="files.length && activeSound" class="py-8 flex flex-row">

    <div v-for="note in notes" :key="note">
      <div class="flex flex-row mr-4">
        {{ note }} 
        <input 
          class="ml-2"
          type="checkbox"
          :value="note"
          :checked="note === activeSound"
          @change="value => setActiveSound(value.target.value, false)"
        >
      </div>
    </div>

    <!-- Sound files -->
    <div v-for="file in files" :key="file.url">
      <div class="flex flex-row mr-4">
        {{ file.name }} 
        <input
          class="ml-2"
          type="checkbox"
          :value="file.url"
          :checked="file.url === activeSound"
          @change="value => setActiveSound(value.target.value, true)"
        >
      </div>
      <audio controls class="mr-4">
        <source :src="file.url" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
    </div>
  </div>
</template>

