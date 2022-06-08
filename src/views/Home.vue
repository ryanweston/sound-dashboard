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
const isFile = ref(true);
const filesAmount = ref(0);
let files = ref([]);

const isActive = ref(false);

function setActiveSound(sound, file) {
  file ? (isFile.value = true) : (isFile.value = false);
  activeSound.value = sound;
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
    });
    buffers.push(buffer);
  }
}

watch(velocity, async (newVelocity, oldVelocity) => {
  // set sound volume
  players[activeSound.value.id].volume.value =
    (newVelocity / 200) * (newVelocity / 300);
  // players[activeSound.value.id].volume.value = newVelocity / 100;
  console.log(newVelocity / 100 - 0.5);
  if (newVelocity != oldVelocity) {
    console.log(newVelocity);
    if (newVelocity < 50 && isActive.value) {
      console.log("RELEASE");
      if (isFile.value) {
        players[activeSound.value.id].stop(); // issue here that the active sound is changed midway through velocity, it wont remove the previous sound from playing
      } else {
        synth.triggerRelease();
      }
      isActive.value = false;
    } else if (newVelocity >= 50 && !isActive.value) {
      if (isFile.value) {
        players[activeSound.value.id].toDestination();
        players[activeSound.value.id].start();
      } else {
        synth.triggerAttack(activeSound.value.url);
      }
      isActive.value = true;
    }
  }
});

function getBackground(bool) {
  if (!bool) {
    return "bg-red-300 pl-2";
  }
  return "pl-2";
}

async function start() {
  await Tone.start();
  await loadBuffers();
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
      Sound dashboard
      <br />
    </h2>
    <div class="py-4">
      <h3
        class="
          text-xl
          leading-9
          text-center
          underline
          font-bold
          tracking-tight
          text-gray-900
          sm:leading-10
        "
      >
        Connections
      </h3>
      <div :class="getBackground(connectedToServer)">
        <h3
          class="
            text-l
            leading-9
            text-center
            tracking-tight
            text-gray-900
            sm:leading-10
          "
        >
          Client: <b> {{ connectedToServer }} </b>
        </h3>
      </div>
      <div :class="getBackground(connectedToArduino)">
        <h3
          class="
            text-l
            leading-9
            text-center
            tracking-tight
            text-gray-900
            sm:leading-10
          "
        >
          Arduino: <b> {{ connectedToArduino }} </b>
        </h3>
      </div>
    </div>
    <div>
      <label>Velocity</label>
      <input v-model="velocity" type="range" min="0" max="1000" />
      {{ velocity }}
    </div>

    <SoundFiles
      :setActiveSound="setActiveSound"
      :activeSound="activeSound"
      :setFilesAmount="setFilesAmount"
      :setFiles="setFiles"
      :files="files"
    />

    <button
      @click="start"
      class="
        inline-flex
        items-center
        justify-center
        rounded-md
        border border-transparent
        bg-black
        px-5
        py-3
        text-white
        font-medium
        leading-6
        text-white
        transition
        duration-150
        ease-in-out
        hover:bg-white hover:text-black
        focus:outline-none
      "
    >
      INITIALISE APP
    </button>

    <FileUpload />
  </div>
</template>
