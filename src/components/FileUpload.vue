<template>
  <div class="container">
    <!--UPLOAD-->
    <form enctype="multipart/form-data" class="mt-5">
      <div class="dropbox bg-white border-2 border-primary text-primary hover:bg-primary hover:border-0 hover:text-white font-medium leading-6 text-center">
        <input
          type="file"
          multiple="multiple"
          @change="
            filesChange($event.target.files);
            fileCount = $event.target.files.length;
          "
          accept="file"
          class="input-file"
        />
        <p>
          Upload sound files
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { upload } from "@/utils/upload-service.js";

export default {
  name: "FileUpload",
  methods: {
    async save(formData) {
      await upload(formData);
    },
    filesChange(fileList) {
      // handle file changes
      const formData = new FormData();

      if (!fileList.length) return;
      // append the files to FormData
      Array.from(Array(fileList.length).keys()).map((x) => {
        formData.append("file", fileList[x], fileList[x].name);
      });

      // send it
      this.save(formData);
    },
  },
};
</script>

<style lang="scss">
.dropbox {
  border-radius:10px;
  padding: 10px 0px;
  min-height: 50px; /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  height: 50px;
  position: absolute;
  cursor: pointer;
}
</style>