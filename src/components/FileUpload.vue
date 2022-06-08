<template>
  <div class="container">
    <!--UPLOAD-->
    <form enctype="multipart/form-data">
      <h1 class="mt-5">Upload Sound Files</h1>
      <div class="dropbox">
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
          Drag your file(s) here to begin<br />
          or click to browse
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
  outline: 2px dashed grey; /* the dash box */
  outline-offset: -10px;
  background: lightcyan;
  color: dimgray;
  padding: 10px 10px;
  min-height: 200px; /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 200px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}
</style>