<template>
  <v-list nav density="compact">
    <v-list-item
      prepend-icon="mdi-home"
      title="หน้าหลัก"
      value="home"
      to="/"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-account-group"
      title="ลูกค้า"
      value="customers"
      to="/customers"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-truck"
      title="ซัพพลายเออร์"
      value="suppliers"
      to="/suppliers"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-wrench"
      title="งานซ่อม"
      value="repairs"
      to="/repairs"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-archive"
      title="สินค้า"
      value="products"
      to="/products"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-shape-outline"
      title="หมวดหมู่"
      value="categories"
      to="/categories"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-ruler"
      title="หน่วยนับ"
      value="units"
      to="/units"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-chart-bar"
      title="รายงาน"
      value="reports"
      to="/reports"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>

    <v-divider class="my-3"></v-divider>

    <v-list-item
      prepend-icon="mdi-cog"
      title="ตั้งค่า"
      value="settings"
      to="/settings"
      :title-opacity="collapsed ? 0 : 1"
    ></v-list-item>
  </v-list>
</template>

<script setup lang="ts">
defineProps<{
  collapsed: boolean;
}>();
</script>

<style scoped>
/* Add any custom styles here if needed */
.v-list-item--active {
  font-weight: 500;
}

/* Ensure proper transition when switching between collapsed and expanded states */
.v-list-item__title {
  transition: opacity 0.2s ease;
}
</style>
