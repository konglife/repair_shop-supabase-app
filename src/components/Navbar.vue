<template>
  <div class="navbar">
    <!-- Left Section -->
    <div class="navbar-left">
      <!-- Sidebar Toggle Button -->
      <SidebarToggle 
        :collapsed="isMobile || sidebarCollapsed" 
        @toggle="toggleSidebar" 
      />

      <!-- Breadcrumbs -->
      <NavbarBreadcrumbs />
    </div>

    <!-- Right Actions -->
    <div class="navbar-right">
      <!-- Dark Mode Toggle -->
      <ThemeToggle :is-dark="isDark" @toggle="toggleDark" />

      <!-- Notification Badge -->
      <NotificationBadge 
        v-if="!isMobile" 
        :count="notificationCount" 
      />

      <!-- User Name - Only visible on larger screens -->
      <span v-if="!isMobile" class="user-name">{{ userDisplayName }}</span>
      
      <!-- User Dropdown -->
      <UserMenu 
        :display-name="userDisplayName" 
        :avatar-url="userAvatarUrl"
        @command="(cmd) => $emit('command', cmd)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavbarBreadcrumbs from './common/NavbarBreadcrumbs.vue';
import ThemeToggle from './common/ThemeToggle.vue';
import NotificationBadge from './common/NotificationBadge.vue';
import UserMenu from './common/UserMenu.vue';
import SidebarToggle from './common/SidebarToggle.vue';

// Currently using emit events instead of props
const emit = defineEmits(['toggle-sidebar', 'toggle-dark', 'command']);

// ใช้ตัวแปรภายในแทน props ที่ถูกลบออกไป
const isMobile = ref(false);
const sidebarCollapsed = ref(false);
const isDark = ref(false);
const userDisplayName = ref('ผู้ใช้งาน');
const userAvatarUrl = ref('');
const notificationCount = ref(0);

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