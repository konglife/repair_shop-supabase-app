<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>404 - ไม่พบหน้า</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="text-center">
            <p class="text-h5">ขออภัย, ไม่พบหน้าที่คุณกำลังมองหา</p>
            <v-btn color="primary" class="mt-4" to="/">กลับหน้าหลัก</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// ไม่มี script logic ที่จำเป็นสำหรับหน้านี้
</script>

<style scoped>
/* ไม่มี style ที่จำเป็นสำหรับหน้านี้ */
</style>
