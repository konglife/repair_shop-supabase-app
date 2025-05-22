<template>
  <!-- ใช้ w-100 เพื่อให้ navbar กว้างเต็มพื้นที่ -->
  <div class="d-flex align-center justify-space-between w-100">
    <!-- Left Section -->
    <div class="d-flex align-center">
      <!-- Sidebar Toggle Button -->
      <SidebarToggle 
        :collapsed="isMobile || sidebarCollapsed" 
        @toggle="toggleSidebar" 
      />

      <!-- Breadcrumbs -->
      <NavbarBreadcrumbs />
    </div>

    <!-- Right Actions -->
    <v-toolbar-items class="d-flex align-center">
      <!-- Dark Mode Toggle -->
      <ThemeToggle :is-dark="isDark" @toggle="toggleDark" class="mr-2" />

      <!-- Notification Badge -->
      <NotificationBadge 
        v-if="!isMobile" 
        :count="notificationCount" 
        class="mr-2"
      />

      <!-- User Menu และปุ่ม Logout - แสดงเมื่อล็อกอินแล้ว -->
      <template v-if="isLoggedIn">
        <!-- User Name - Only visible on larger screens -->
        <span v-if="!isMobile" class="user-name mr-2">{{ userDisplayName }}</span>
        
        <!-- User Dropdown - ใช้ UserMenu คอมโพเนนต์ -->
        <UserMenu 
          :display-name="userDisplayName" 
          :avatar-url="userAvatarUrl"
          @command="handleCommand"
          class="mr-2"
        />
        
        <!-- Logout Button (Icon only for better UI/UX) -->
        <v-btn icon variant="text" color="error" @click="logout" class="mr-2">
          <v-icon>mdi-logout</v-icon>
          <v-tooltip activator="parent" location="bottom">ออกจากระบบ</v-tooltip>
        </v-btn>
      </template>
      
      <!-- Login Button - แสดงเมื่อยังไม่ได้ล็อกอิน -->
      <v-btn v-else variant="outlined" color="primary" @click="router.push('/login')" class="mr-2">
        <v-icon class="mr-2">mdi-login</v-icon>
        เข้าสู่ระบบ
      </v-btn>
    </v-toolbar-items>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import NavbarBreadcrumbs from './common/NavbarBreadcrumbs.vue';
import ThemeToggle from './common/ThemeToggle.vue';
import NotificationBadge from './common/NotificationBadge.vue';
import SidebarToggle from './common/SidebarToggle.vue';
import UserMenu from './common/UserMenu.vue';
import { useAuthStore } from '../stores/auth'; // Import useAuthStore

// ใช้ router สำหรับการนำทาง
const router = useRouter();

// ดึงข้อมูลการตรวจสอบสิทธิ์จาก useAuthStore
const authStore = useAuthStore();
const { user, isLoggedIn } = authStore; // ดึง user และ isLoggedIn จาก store

// Currently using emit events instead of props
const emit = defineEmits(['toggle-sidebar', 'toggle-dark', 'command']);

// ใช้ตัวแปรภายในแทน props ที่ถูกลบออกไป
const isMobile = ref(false);
const sidebarCollapsed = ref(false);
const isDark = ref(false);
const notificationCount = ref(0);

// คำนวณชื่อที่จะแสดงและ URL ของรูปโปรไฟล์
const userDisplayName = computed(() => user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ผู้ใช้งาน');
const userAvatarUrl = computed(() => user?.user_metadata?.avatar_url || '');

// ฟังก์ชันสำหรับการออกจากระบบ
const logout = async () => {
  try {
    await authStore.signOut(); // เรียกใช้ signOut จาก authStore
    router.push('/login'); // นำทางไปยังหน้า login หลังจากออกจากระบบ
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// ฟังก์ชันจัดการคำสั่งจากเมนูผู้ใช้
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      logout();
      break;
    default:
      break;
  }
};

const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const toggleDark = () => {
  emit('toggle-dark');
};
</script>

<style scoped>
/* Base navbar styles */
.navbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e5e5;
  background-color: white;
}

.dark .navbar {
  background-color: #1a1a1a;
  border-color: #333;
}

/* Left section */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  margin-right: auto;
}

.sidebar-toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon, .close-icon {
  line-height: 1;
}

.dark .menu-icon, .dark .close-icon {
  color: #aaa;
}

/* Breadcrumbs - using Vuetify v-breadcrumbs now */
.v-breadcrumbs {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.v-breadcrumbs-item--disabled {
  opacity: 0.7;
}

.dark .v-breadcrumbs-item--disabled {
  color: #bbb !important;
}

.v-breadcrumbs-item {
  font-size: 14px;
}

/* Right section */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.light-mode-icon {
  color: #ffa600;
}

.dark-mode-icon {
  color: #666;
}

/* Notification */
.notification-container {
  position: relative;
}

.notification-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 16px;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f44336;
  color: white;
  font-size: 11px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.dark .user-name {
  color: #ddd;
}

/* User dropdown */
.user-dropdown {
  position: relative;
  display: inline-block;
}

.user-avatar-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #555;
}

.dark .user-avatar {
  background-color: #333;
  color: #ddd;
}

.user-menu {
  position: absolute;
  right: 0;
  top: 45px;
  width: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 50;
  overflow: hidden;
}

.dark .user-menu {
  background-color: #222;
  border: 1px solid #333;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.dark .menu-item:hover {
  background-color: #2a2a2a;
}

.menu-icon {
  display: inline-flex;
  font-size: 16px;
}

/* Media queries */
@media (min-width: 768px) {
  .navbar-right {
    gap: 20px;
  }
  
  .user-name {
    display: block;
  }
}

@media (max-width: 767px) {
  .user-name {
    display: none;
  }
}

.dropdown-content {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.2s, transform 0.2s;
  visibility: hidden;
}

.dropdown:focus-within .dropdown-content {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}
</style>
