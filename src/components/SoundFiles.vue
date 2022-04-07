<script lang="ts" setup>
import { ref, onMounted, defineProps } from 'vue'
import axios from 'axios'

let notes = ref(['C4', 'F4'])

interface Props { 
  setActiveSound: Function,
  activeSound: Object,
  setFilesAmount: Function,
  setFiles: Function,
  files: any
}

const props = defineProps<Props>()

const reff = ref(props.activeSound)

// @ts-ignore
onMounted(async () => {
  const res = await axios.get('http://localhost:3000/files')
  props.setFiles(res.data)
  props.setFilesAmount(res.data.length)
  console.log(props.files)
});

</script>

<template>
  <h2 class="text-lg">Uploaded sounds</h2>
  <div v-if="props.files">
    <div v-if="props.files.length && activeSound" class="py-8 flex flex-row">
    <!-- @ts-ignore -->
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
      <div v-for="(file, index) in props.files" :key="file.url">
        <div class="flex flex-row mr-4">
          {{ file.name }} 
          <input
            class="ml-2"
            type="radio"
            :value="file.url"
            v-model="reff.url"
            @change="value => setActiveSound({ url: value.target.value, id: index}, true)"
          >
        </div>
        <audio controls class="mr-4">
          <source :src="file.url" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  </div>

</template>

