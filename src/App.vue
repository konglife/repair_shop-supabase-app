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

    <!-- Top App Bar -->
    <v-app-bar
      elevation="1"
      density="comfortable"
    >
      <template v-slot:prepend>
        <div class="d-flex align-center">
          <v-app-bar-nav-icon @click="toggleSidebar"></v-app-bar-nav-icon>
          
          <!-- Breadcrumbs -->
          <v-breadcrumbs
            v-if="!isMobile"
            :items="breadcrumbItems"
            class="pa-0 ml-2"
            density="compact"
          >
            <template v-slot:divider>
              <v-icon icon="mdi-chevron-right" size="small"></v-icon>
            </template>
            <template v-slot:item="{ item, index }">
              <v-breadcrumbs-item
                :to="index < breadcrumbItems.length - 1 ? item.to : undefined"
                :disabled="index === breadcrumbItems.length - 1"
              >
                {{ item.title }}
              </v-breadcrumbs-item>
            </template>
          </v-breadcrumbs>
        </div>
      </template>

      <!-- Right Menu Items -->
      <template v-slot:append>
        <!-- Dark Mode Toggle -->
        <v-btn icon @click="toggleDark">
          <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
        </v-btn>

        <!-- Notification Button -->
        <v-btn v-if="!isMobile" icon>
          <v-icon>mdi-bell</v-icon>
          <v-badge v-if="notificationCount > 0" dot color="error" floating></v-badge>
        </v-btn>

        <!-- User Menu -->
        <v-menu v-if="isLoggedIn" min-width="200" location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" class="ml-2">
              <v-avatar size="36" class="mr-2">
                <v-img
                  v-if="userAvatarUrl && userAvatarUrl !== 'https://cube.elemecdn.com/0/88/03b0dff406b7e99c14ab6e7fd71e-jp.png'"
                  :src="userAvatarUrl"
                  alt="User Avatar"
                ></v-img>
                <span v-else class="text-high-emphasis">{{ getInitials(userDisplayName) }}</span>
              </v-avatar>
              <span v-if="!isMobile" class="text-caption text-medium-emphasis">{{ userDisplayName }}</span>
              <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="handleCommand('profile')" prepend-icon="mdi-account" title="โปรไฟล์"></v-list-item>
            <v-list-item @click="handleCommand('settings')" prepend-icon="mdi-cog" title="ตั้งค่า"></v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="handleCommand('logout')" prepend-icon="mdi-logout" title="ออกจากระบบ"></v-list-item>
          </v-list>
        </v-menu>
        
        <!-- Login Button (when not logged in) -->
        <v-btn v-else variant="outlined" color="primary" @click="router.push('/login')">
          <v-icon class="mr-2">mdi-login</v-icon>
          เข้าสู่ระบบ
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>
    
    <!-- Global Components -->
    <ConfirmationDialog />
    <NotificationSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from './composables/common/useAuth';

// Lazy load components
const Sidebar = defineAsyncComponent(() => import('./components/Sidebar.vue'));
const ConfirmationDialog = defineAsyncComponent(() => import('./components/common/ConfirmationDialog.vue'));
const NotificationSnackbar = defineAsyncComponent(() => import('./components/common/NotificationSnackbar.vue'));

const router = useRouter();
const route = useRoute();
const { user, isLoggedIn, logout: authLogout } = useAuth();

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

// Breadcrumb items for navigation
const breadcrumbItems = computed(() => {
  // Default home item
  const items = [
    {
      title: 'หน้าหลัก',
      disabled: false,
      to: '/',
    }
  ];
  
  const path = route.path;
  
  // Add current route and its parents based on path
  if (path.includes('/customers')) {
    // For customer list
    if (path === '/customers') {
      items.push({
        title: 'รายการลูกค้า',
        disabled: true,
        to: '/customers',
      });
    }
    // For customer add
    else if (path === '/customers/new' || path.includes('/customers/add')) {
      items.push({
        title: 'รายการลูกค้า',
        disabled: false,
        to: '/customers',
      });
      items.push({
        title: 'เพิ่มลูกค้าใหม่',
        disabled: true,
        to: '',
      });
    }
    // For customer edit
    else if (path.match(/^\/customers\/[^\/]+$/) && path !== '/customers/new') {
      items.push({
        title: 'รายการลูกค้า',
        disabled: false,
        to: '/customers',
      });
      items.push({
        title: 'แก้ไขข้อมูลลูกค้า',
        disabled: true,
        to: '',
      });
    }
  }
  // Add other routes as needed
  else if (path === '/profile') {
    items.push({
      title: 'โปรไฟล์',
      disabled: true,
      to: '/profile',
    });
  }
  else if (path === '/settings') {
    items.push({
      title: 'ตั้งค่า',
      disabled: true,
      to: '/settings',
    });
  }
  else if (path.includes('/repairs')) {
    items.push({
      title: 'งานซ่อม',
      disabled: true,
      to: '/repairs',
    });
  }
  else if (path.includes('/products')) {
    items.push({
      title: 'สินค้า',
      disabled: true,
      to: '/products',
    });
  }
  else if (path.includes('/reports')) {
    items.push({
      title: 'รายงาน',
      disabled: true,
      to: '/reports',
    });
  }
  
  return items;
});

const sidebarCollapsed = ref(false); // For desktop collapse state
const isMobile = ref(window.innerWidth <= 768); // Check initial screen size
const isMobileSidebarVisible = ref(false); // For mobile overlay visibility

// Placeholder for global search and notifications
const notificationCount = ref(0); // Example notification count
const userDisplayName = computed(() => user.value?.name || user.value?.email || 'ผู้ใช้'); // Get user display name
const userAvatarUrl = computed(() => user.value?.avatar_url || 'https://cube.elemecdn.com/0/88/03b0dff406b7e99c14ab6e7fd71e-jp.png'); // Placeholder Avatar

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

// getInitials function to display user avatar text
const getInitials = (name: string) => {
  if (!name) return 'NA';
  
  // Handle email addresses
  if (name.includes('@')) {
    const username = name.split('@')[0];
    if (username.length > 1) {
      return username.substring(0, 2).toUpperCase();
    } 
    return username.substring(0, 1).toUpperCase().repeat(2);
  }
  
  // Regular name - take first 2 letters
  return name.substring(0, 2).toUpperCase();
};

// Logout logic using useAuth composable
const logout = async () => {
  try {
    authLogout(); // ใช้ฟังก์ชัน logout จาก useAuth composable
    // ไม่จำเป็นต้อง redirect เพราะ useAuth จะจัดการให้
  } catch (error) {
    console.error('Logout failed:', error);
    // Handle logout error (e.g., show a notification)
  }
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      logout();
      break;
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
  }
};

// Add/Remove resize listener
onMounted(() => {
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
