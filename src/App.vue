<template>
  <v-app :theme="isDark ? 'dark' : 'light'">
    <!-- Sidebar / Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="sidebarCollapsed && !isMobile"
      width="256"
      :temporary="isMobile"
      :permanent="!isMobile"
      elevation="2"
    >
      <!-- App Logo and Title -->
      <v-list-item
        prepend-avatar="/vite.svg"
        :title="!sidebarCollapsed || isMobile ? 'RepairPro' : ''"
        lines="one"
        class="py-4"
      ></v-list-item>

      <v-divider></v-divider>

      <!-- Sidebar Navigation -->
      <Sidebar :collapsed="sidebarCollapsed && !isMobile" />
    </v-navigation-drawer>

    <!-- Top App Bar - ใช้ Navbar component แทน -->
    <v-app-bar elevation="1" density="comfortable">
      <Navbar 
        @toggle-sidebar="toggleSidebar" 
        @toggle-dark="toggleDark" 
      />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </v-container>
    </v-main>
    
    <!-- Global Components -->
    <ConfirmationDialog />
    <NotificationSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useAuth } from './composables/common/useAuth';

// Lazy load components
const Sidebar = defineAsyncComponent(() => import('./components/Sidebar.vue'));
const Navbar = defineAsyncComponent(() => import('./components/Navbar.vue'));
const ConfirmationDialog = defineAsyncComponent(() => import('./components/common/ConfirmationDialog.vue'));
const NotificationSnackbar = defineAsyncComponent(() => import('./components/common/NotificationSnackbar.vue'));



// Drawer state for v-navigation-drawer
const drawer = ref(true);

// Dark mode toggle
const isDark = ref(localStorage.getItem('dark-mode') === 'true');
const toggleDark = () => {
  isDark.value = !isDark.value;
  localStorage.setItem('dark-mode', isDark.value.toString());
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const sidebarCollapsed = ref(false); // For desktop collapse state
const isMobile = ref(window.innerWidth <= 768); // Check initial screen size
const isMobileSidebarVisible = ref(false); // For mobile overlay visibility

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isMobileSidebarVisible.value = false; // Close mobile sidebar if screen becomes larger
  }
};

const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileSidebarVisible.value = !isMobileSidebarVisible.value;
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }
};

// Add/Remove resize listener and initialize auth
onMounted(async () => {
  const { initialize: initializeAuth } = useAuth();
  try {
    await initializeAuth();
    console.log('[App.vue] Auth initialized successfully.');
  } catch (error) {
    console.error('[App.vue] Error during auth initialization:', error);
  }

  window.addEventListener('resize', checkScreenSize);
  checkScreenSize(); // Initial check
  
  // Initialize dark mode
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>
