<script> 
export default { 
  props: { 
    action: Function
  }
}
</script>

<template>
  <div class="ml-3 inline-flex rounded-md shadow">
    <button
      target="_blank"
      @click="action()"
      href="https://github.com/web2033/vite-vue3-tailwind-starter"
      class="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-5 py-3 text-white font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-white hover:text-black focus:outline-none"
      >
      <slot></slot>
    </button>
  </div>
</template>
