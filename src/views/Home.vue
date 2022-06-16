<script setup>
import FileUpload from "@/components/FileUpload.vue";
import SoundFiles from "@/components/SoundFiles.vue";
import { io } from "socket.io-client";

import * as Tone from "tone";
import { ref, reactive, watch } from "vue";

const socket = io("http://localhost:3000", { query: "name=client" });

const connectedToServer = ref(false);
const connectedToArduino = ref(false);

socket.on("connectedDevices", function (data) {
  if (data.includes("client")) {
    connectedToServer.value = true;
  } else {
    connectedToServer.value = false;
  }
  if (data.includes("arduino")) {
    connectedToArduino.value = true;
  } else {
    connectedToArduino.value = false;
  }
});

let velocity = ref(-100);

socket.on("velocity", function (data) {
  if (data > 50) {
    console.log(velocity.value);
    velocity.value = data;
  } else {
    velocity.value = 0;
  }
});

const activeSound = reactive({});
const applicationStarted = ref(false);
const isFile = ref(true);
const filesAmount = ref(0);
let files = ref([]);

const isActive = ref(false);

const queue = ref([]);

function setActiveSound(sound, file) {
  file ? (isFile.value = true) : (isFile.value = false);
  activeSound.value = sound;
  queue.value.push(sound.id)
}

const synth = new Tone.Synth().toDestination();
let players = []; // declare this here so we can access it in different functions
let buffers = [];

const setFiles = (filesWow) => {
  files.value = filesWow;
};

function setFilesAmount(amount) {
  filesAmount.value = amount;
}

function loadBuffers() {
  for (let i = 0; i < filesAmount.value; i++) {
    let buffer = new Tone.ToneAudioBuffer(files.value[i].url, () => {
      players[i] = new Tone.Player(buffer);
      players[i].loop = true
    });
    buffers.push(buffer);
  }
}


const stopSound = (id) => { 
  if (isFile.value) {
    players[id].stop(); 
  } else {
    synth.triggerRelease();
  }
}

const startSound = (id) => { 
  if (isFile.value) {
    players[id].toDestination();
    players[id].start();
  } else {
    synth.triggerAttack(activeSound.value.url);
  }
}

watch(
  () => ({...activeSound}), 
  (newActive, oldActive) => {  
    if (oldActive.value) {
      stopSound(oldActive.value.id);
    }

    if (velocity.value >= 50) {
      startSound(newActive.value.id);
    }
})

watch(velocity, async (newVelocity, oldVelocity) => {
  if (newVelocity != oldVelocity) {
    if (newVelocity < 50 && isActive.value) {
      stopSound(activeSound.value.id);
      isActive.value = false;
    } else if (newVelocity >= 50 && !isActive.value) {
      startSound(activeSound.value.id);
      isActive.value = true;
    }
  }
});

function getBackground(bool) {
  return bool ? "bg-green-200" : "bg-red-200";
}

async function start() {
  await Tone.start();
  loadBuffers();
  applicationStarted.value = true
}
</script>

<template>
  <div
    class="
      mx-auto
      max-w-screen-xl
      px-4
      py-12
      sm:px-6
      lg:flex-column lg:items-center lg:justify-between lg:py-16 lg:px-8
    "
  >
    <h2
      class="
        text-3xl
        font-extrabold
        leading-9
        tracking-tight
        text-gray-900
        sm:text-4xl sm:leading-10
      "
    >
      Sound Drop Interface
      <br />
    </h2>
    <p>A product by Firoza</p>

    <div class="bg-gray-100 mt-10 rounded-lg flex flex-row items-center px-8 py-4 space-between w-full">
       <div class="w-1/2">
        <label class="text-xl leading-9 font-bold tracking-tight text-gray-900 sm:leading-10">Velocity</label>
        <div class="w-full">
          <input 
            :class="['range-slider__range', !applicationStarted? 'cursor-not-allowed focus:outline-none disabled:opacity-25' : '']"
            :disabled="!applicationStarted" 
            v-model="velocity"
            type="range" 
            min="0" 
            max="1000"
          />
          <span 
            :class="['range-slider__value', isActive ? 'override-slider__active' : '', !applicationStarted ? 'focus:outline-none opacity-25' : '']"
          >
            {{ velocity }}
          </span>
        </div>
      </div>

      <div class="ml-6">
        <h3
          class="text-xl leading-9 font-bold tracking-tight text-gray-900 sm:leading-10"
          > 
            Connections
        </h3>
        <div class="flex flex-row">
          <div :class="[getBackground(connectedToServer), 'rounded-lg px-4']">
            <h3
            class="text-l leading-9 tracking-tight text-gray-900 sm:leading-10"
            > 
              Client: <b> {{ connectedToServer }} </b>
            </h3>
          </div>
          <div :class="[getBackground(connectedToArduino), 'ml-2 rounded-lg px-4']">
            <h3
            class="text-l leading-9 text-center tracking-tight text-gray-900 sm:leading-10"
            > 
              Arduino: <b> {{ connectedToArduino }} </b>
            </h3>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-6">
      <div class="col-span-4">
        <h2 class="text-2xl mt-8 font-bold">Uploaded sounds</h2>
        <SoundFiles
          :setActiveSound="setActiveSound"
          :activeSound="activeSound"
          :setFilesAmount="setFilesAmount"
          :setFiles="setFiles"
          :files="files"
        />
      </div>
      <div class="col-span-2">
        <h2 class="text-2xl mt-8 font-bold">Controls</h2>
        <div class="mt-5">
          <div class="flex flex-row">
            <div :class="[getBackground(applicationStarted), 'mr-2 rounded-lg px-4 inline-flex items-center justify-center']">
              <h3
                class="text-l tracking-tight text-gray-900"
                > 
                  {{ applicationStarted ? 'Application is active' : 'Application is not active' }}
              </h3>
            </div>
            <button
              @click="start"
              :class="['inline-flex items-center justify-center rounded-md border-2 border-transparent bg-primary px-5 py-3 text-white font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-white hover:text-primary hover:border-2 hover:border-primary focus:outline-none',
              applicationStarted ? 'cursor-not-allowed focus:outline-none disabled:opacity-25' : '']"
              :disabled="applicationStarted"
            >
              Start application
            </button>
          </div>  
          <FileUpload />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Base Colors
$shade-10: #2c3e50 !default;
$shade-1: #d7dcdf !default;
$shade-0: #fff !default;
$teal: #1abc9c !default;

// Reset
* {
  &,
  &:before,
  &:after {
    box-sizing: border-box;
  }
}

.range-slider {
  margin: 60px 0 0 0%;
}

// Range Slider
$range-width: 100% !default;

$range-handle-color: $shade-10 !default;
$range-handle-color-hover: $teal !default;
$range-handle-size: 20px !default;

$range-track-color: $shade-1 !default;
$range-track-height: 10px !default;

$range-label-color: $shade-10 !default;
$range-label-width: 60px !default;

.range-slider {
  width: $range-width;
}
.range-slider__range {
  -webkit-appearance: none;
  width: calc(100% - (#{$range-label-width + 13px}));
  height: $range-track-height;
  border-radius: 5px;
  background: $range-track-color;
  outline: none;
  padding: 0;
  margin: 0;

  // Range Handle
  &::-webkit-slider-thumb {
    appearance: none;
    width: $range-handle-size;
    height: $range-handle-size;
    border-radius: 50%;
    background: $range-handle-color;
    cursor: pointer;
    transition: background .15s ease-in-out;

    &:hover {
      background: $range-handle-color-hover;
    }
  }

  &:active::-webkit-slider-thumb {
    background: $range-handle-color-hover;
  }

  &::-moz-range-thumb {
    width: $range-handle-size;
    height: $range-handle-size;
    border: 0;
    border-radius: 50%;
    background: $range-handle-color;
    cursor: pointer;
    transition: background .15s ease-in-out;

    &:hover {
      background: $range-handle-color-hover;
    }
  }

  &:active::-moz-range-thumb {
    background: $range-handle-color-hover;
  }
  
  // Focus state
  &:focus {
    
    &::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px $shade-0,
                  0 0 0 6px $teal;
    }
  }
}

// Range Label
.range-slider__value {
  display: inline-block;
  position: relative;
  width: $range-label-width;
  color: $shade-0;
  line-height: 20px;
  text-align: center;
  border-radius: 3px;
  background: $range-label-color;
  padding: 5px 10px;
  margin-left: 8px;

  &:after {
    position: absolute;
    top: 8px;
    left: -7px;
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-right: 7px solid $range-label-color;
    border-bottom: 7px solid transparent;
    content: '';
  }
}

.override-slider__active { 
   background: $teal;
   &:after { 
      border-right: 7px solid $teal;
   }
}

// Firefox Overrides
::-moz-range-track {
    background: $range-track-color;
    border: 0;
}

input::-moz-focus-inner,
input::-moz-focus-outer { 
  border: 0; 
}
</style>
