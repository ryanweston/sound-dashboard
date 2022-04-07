<script setup>
import FileUpload from '@/components/FileUpload.vue'
import SoundFiles from '@/components/SoundFiles.vue'
import { io } from "socket.io-client";

import * as Tone from 'tone'
import { ref, reactive, watch } from 'vue'


const socket = io('http://localhost:3000', { query: "name=client" })

const serverVelocity = ref(0)
const connectedToServer = ref(false)
const connectedToArduino = ref(false)

socket.on('connectedDevices', function(data) {
  console.log(data)
  if(data.includes('client')) {
    connectedToServer = true
  } else {
    connectedToServer = false
  }
  if(data.includes('arduino')) {
    connectedToArduino = true
  } else {
    connectedToArduino = false
  }
});

let velocity = ref(-100)

socket.on('velocity', function( data ) {
  console.log(data)
  serverVelocity.value = data.velocity
});

// const activeSound = ref('C4')
const activeSound = reactive({})
const isFile = ref(true)
const filesAmount = ref(0)
let files = ref([]);


const isActive = ref(false)

function setActiveSound(sound, file) {
  file ? isFile.value = true : isFile.value = false
  activeSound.value = sound
  console.log(activeSound.value);
}

const synth = new Tone.Synth().toDestination();
let players = [];	// declare this here so we can access it in different functions
let buffers = [];

const setFiles = (filesWow) => {
  files.value = filesWow
}

function setFilesAmount (amount) {
  filesAmount.value = amount
  console.log(filesAmount.value)
} 

function loadBuffers() {
  for (let i = 0; i < filesAmount.value; i++) {
    let buffer = new Tone.ToneAudioBuffer(files.value[i].url, () => {
      console.log('LOADED')
      players[i] = new Tone.Player(buffer)
      console.log(i)
      // players[i].toDestination();
    })
    console.log(buffer)
    buffers.push(buffer)
  }
  console.log(filesAmount)
}

watch(velocity, async (newVelocity, oldVelocity) => {
  if (newVelocity != oldVelocity) {
    console.log(activeSound.value)
    if (newVelocity < 200) {
      console.log('RELEASE')
      if (isFile.value) {
        players[activeSound.value.id].stop() // issue here that the active sound is changed midway through velocity, it wont remove the previous sound from playing
        players[activeSound.value.id].disconnect()
      } else {
        synth.triggerRelease();
      }
      isActive.value = false;
    } else if (newVelocity >= 200){ 
      console.log('SHOULD TRIGGER')
      if (isFile.value) {
        console.log('Player', players)
        players[activeSound.value.id].toDestination()
        players[activeSound.value.id].start();
      } else {
        synth.triggerAttack(activeSound.value.url);
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
  await Tone.start();
  loadBuffers();
	console.log('audio is ready')
  setTimeout(() => { console.log('players', players)}, 3000)
  console.log('buffers', buffers)
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
      <div :class="getBackground(connectedToServer)">
        <h3
        class="text-l leading-9 text-center tracking-tight text-gray-900 sm:leading-10"
        > 
          Client: <b> {{ connectedToServer }} </b>
        </h3>
      </div>
      <div :class="getBackground(connectedToArduino)">
        <h3
        class="text-l leading-9 text-center tracking-tight text-gray-900 sm:leading-10"
        > 
          Arduino: <b> {{ connectedToArduino }} </b>
        </h3>
      </div>
    </div>
    <div>
      <label>Velocity</label>
      <input v-model="velocity" type="range" min="-100" max="1000"/>
      {{ velocity }}
    </div>

    <SoundFiles 
      :setActiveSound="setActiveSound"
      :activeSound="activeSound"
      :setFilesAmount="setFilesAmount"
      :setFiles="setFiles"
      :files="files"
    />

    
    <button @click="start" class="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-5 py-3 text-white font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-white hover:text-black focus:outline-none">
      INITIALISE APP
    </button>

    <FileUpload />

  </div>
</template>
