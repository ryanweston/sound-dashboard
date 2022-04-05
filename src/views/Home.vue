<script setup>
import ButtonRepo from '@/components/ButtonRepo.vue'
import FileUpload from '@/components/FileUpload.vue'
import SoundFiles from '@/components/SoundFiles.vue'
import { io } from "socket.io-client";

import * as Tone from 'tone'
import { onBeforeMount, onMounted, ref, watch, reactive } from 'vue'


const socket = io('http://localhost:3000', { query: "name=client" })

const serverVelocity = reactive({ value: 0 })
const connectedToServer = reactive({ value: false })
const connectedToArduino = reactive({ value: false })

socket.on('connectedDevices', function(data) {
  console.log(data)
  if(data.includes('client')) {
    connectedToServer.value = true
  } else {
    connectedToServer.value = false
  }
  if(data.includes('arduino')) {
    connectedToArduino.value = true
  } else {
    connectedToArduino.value = false
  }
});

let velocity = ref(-100)

socket.on('velocity', function( data ) {
  console.log(data)
  serverVelocity.value = data.velocity
});

// const activeSound = ref('C4')
const activeSound = ref('http://localhost:8080/files/redParrott.mp3')
const isFile = ref(true)

const isActive = ref(false)

function setActiveSound(sound, file) {
  // let sound = event.target.value
  file ? isFile.value = true : isFile.value = false
  console.log(sound)
  
  activeSound.value = sound
  console.log(isFile)
  console.log(activeSound)
}
// const distortion = ref(20)

const synth = new Tone.Synth().toDestination();
let player;	// declare this here so we can access it in different functions
const buffer = new Tone.ToneAudioBuffer(activeSound.value, () => {
    console.log('LOADED')
    player = new Tone.Player(buffer);
    player.toDestination();
})


// function scale (number, inMin, inMax, outMin, outMax) {
//     return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
// }

watch(velocity, async (newQuestion, oldQuestion) => {
  if (newQuestion != oldQuestion) {
    console.log(isActive.value)
    // const value = scale(newQuestion, -100, 1000, -60, 8)
    if (newQuestion < 200 && isActive.value) {
      console.log('RELEASE')

      if (isFile.value) {
        player.stop()
      } else {
        synth.triggerRelease();
      }
      isActive.value = false;
    } else if (newQuestion >= 200 && !isActive.value){ 
      console.log('SHOULD TRIGGER')
      if (isFile.value) {
        console.log(player)
        player.start();
      } else {
        synth.triggerAttack(activeSound.value);
      }
      isActive.value = true;
    }
  }
})

function getBackground(bool) {
  if(!bool) {
    return 'bg-red-300 pl-2'
  } 
  return 'pl-2'

}
async function start () {
  await Tone.start()
	console.log('audio is ready')
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
    <div class="py-4">
      <h3
        class="text-xl leading-9 text-center underline font-bold tracking-tight text-gray-900 sm:leading-10"
        > 
           Connections
      </h3>
      <div :class="getBackground(connectedToServer.value)">
        <h3
        class="text-l leading-9 text-center tracking-tight text-gray-900 sm:leading-10"
        > 
          Client: <b> {{ connectedToServer.value }} </b>
        </h3>
      </div>
      <div :class="getBackground(connectedToArduino.value)">
        <h3
        class="text-l leading-9 text-center tracking-tight text-gray-900 sm:leading-10"
        > 
          Arduino: <b> {{ connectedToArduino.value }} </b>
        </h3>
      </div>
    </div>
    <div>
      <label>Velocity</label>
      <input v-model="serverVelocity.value" type="range" min="-100" max="1000"/>
      {{ serverVelocity.value }}
    </div>

    <!-- <div>
      <label>Distortion</label>
      <input v-model="distortion" type="range" min="0" max="100"/>
      {{ distortion }}
    </div> -->
    <SoundFiles 
      :setActiveSound="setActiveSound"
      :activeSound="activeSound"
    />
    <button @click="start" class="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-5 py-3 text-white font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-white hover:text-black focus:outline-none">
      INITIALISE APP
    </button>

    <!-- <ButtonRepo :action="playSound">Play sound</ButtonRepo> -->

    <FileUpload />
  </div>
</template>
