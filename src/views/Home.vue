<script setup>
import ButtonRepo from '@/components/ButtonRepo.vue'
import * as Tone from 'tone'
import { ref, watch } from 'vue'

const velocity = ref(30)
const distortion = ref(20)

const synth = new Tone.Synth().toDestination()
const vol = ref(velocity / 100);

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

const tone = ref(synth)

watch(velocity, async (newQuestion, oldQuestion) => {
  if (newQuestion != oldQuestion) {
    const value = scale(newQuestion, 0, 1000, -60, 8)
    synth.volume.value = value
    console.log(synth.volume.value)
  }
})

async function playSound () {
  synth.volume.value = -100
  console.log(synth.volume.value)
  synth.triggerAttack("C4");
}
</script>

<template>
  <div
    class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex-column lg:items-center lg:justify-between lg:py-16 lg:px-8"
  >
    <h2
      class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10"
    >
      Sound dashboard
      <br />
    </h2>
    
    <div>
      <label>Velocity</label>
      <input v-model="velocity" type="range" min="0" max="1000"/>
      {{ velocity }}
    </div>
    

    <div>
      <label>Distortion</label>
      <input v-model="distortion" type="range" min="0" max="100"/>
      {{ distortion }}
    </div>

    <ButtonRepo :action="playSound">Play sound</ButtonRepo>
  </div>
</template>
