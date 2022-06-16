<script lang="ts" setup>
import { ref, onMounted, defineProps, watch, computed} from "vue";
import axios from "axios";

interface activeSound {
  url: string,
  id: number
}

interface Props {
  setActiveSound: Function;
  activeSound: activeSound;
  setFilesAmount: Function;
  setFiles: Function;
  files: any;
}

const props = defineProps<Props>();

const fileToDelete = ref("");

async function deleteFile() {
  console.log(fileToDelete.value);
  const res2 = await axios.post("http://localhost:3000/delete", {
    name: fileToDelete.value,
  });
  console.log(res2);
  closeDialog();
}

// @ts-ignore
onMounted(async () => {
  const res = await axios.get("http://localhost:3000/files");
  const newArr = res.data.filter((sound) => sound.name !== ".DS_Store");
  props.setFiles(newArr);
  props.setFilesAmount(newArr.length);
});



function changeColor(index: string | number | symbol ) {
  console.log(index);
  document.querySelectorAll(".mainSound").forEach((div) => {
    div.classList.remove("border-active", "bg-green-100");
  });
  document.querySelector(`.index-${index}`).classList.add("border-active", "bg-green-100");
}

function openDialog() {
  document.querySelector(".dialog").classList.remove("hidden");
}

function closeDialog() {
  document.querySelector(".dialog").classList.add("hidden");
}
</script>

<template>
  <div
    class="
      dialog
      absolute
      hidden
      bg-white
      border-2
      rounded-lg
      top-1/2
      left-1/3
      w-1/3
      z-50
      text-center
      border-gray-200
      pt-5
      pb-5
      flex flex-col
      shadow-lg
    "
  >
    {{ "Are you sure you want to delete this sound?" }}
    <div class="mt-6 w-full flex justify-evenly g">
      <button @click="closeDialog()">CANCEL</button>
      <button class="text-red-600" @click="deleteFile()">DELETE</button>
    </div>
  </div>

  <div v-if="props.files">
    <div v-if="props.files.length" class="flex flex-row">
      <!-- @ts-ignore -->

      <!-- Sound files -->
      <div class="flex flex-col rounded mb-10 w-full mt-5">
        <button
          v-for="(file, index) in props.files"
          :key="file.url"
          :class="`py-3 pl-3 rounded mainSound my-1 button-width border-2 z-20 index-${String(index)} relative text-left`"
          :value="file.url"
          @click="
            (value) => {
              setActiveSound({ url: value.target.value, id: index }, true);
              changeColor(index);
           }
          "
        > 
          {{ file.name }}
          <button
            @click="
              () => {
                fileToDelete = file.name;
                openDialog();
              }
            "
          >
            <div class="absolute top-1 right-[-60px] flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 p-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </button>

          <source :src="file.url" type="audio/mpeg" />
          <!-- Your browser does not support the audio element. -->
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-width {
  width: calc(100% - 3rem - 60px)
}
</style>
