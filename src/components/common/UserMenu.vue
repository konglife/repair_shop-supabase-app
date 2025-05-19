<template>
  <div class="user-dropdown">
    <button class="user-avatar-button" @click="toggleUserMenu">
      <div v-if="avatarUrl && avatarUrl !== 'https://cube.elemecdn.com/0/88/03b0dff406b7e99c14ab6e7fd71e-jp.png'" class="w-10 h-10 rounded-full">
        <img class="h-10 w-10 rounded-full object-cover" :src="avatarUrl" alt="User Avatar" />
      </div>
      <div v-else class="user-avatar">
        <span>{{ getInitials(displayName) }}</span>
      </div>
    </button>
    <div v-if="menuOpen" class="user-menu">
      <div class="menu-item" @click="$emit('command', 'profile')">
        <v-icon icon="mdi-account" size="small" class="mr-2"></v-icon>
        <span>โปรไฟล์</span>
      </div>
      <div class="menu-item" @click="$emit('command', 'settings')">
        <v-icon icon="mdi-cog" size="small" class="mr-2"></v-icon>
        <span>ตั้งค่า</span>
      </div>
      <div class="menu-item" @click="$emit('command', 'logout')">
        <v-icon icon="mdi-logout" size="small" class="mr-2"></v-icon>
        <span>ออกจากระบบ</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  displayName: {
    type: String,
    default: 'ผู้ใช้งาน'
  },
  avatarUrl: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['command']);

const menuOpen = ref(false);

const toggleUserMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// function to generate initials from name (first two letters)
const getInitials = (name: string) => {
  if (!name) return 'NA';
  
  // ถ้าเป็นอีเมล ให้ใช้ตัวอักษรแรกจากชื่อผู้ใช้ก่อน @ 
  if (name.includes('@')) {
    const username = name.split('@')[0];
    // ถ้าชื่อผู้ใช้มีความยาวมากกว่า 1 ตัวอักษร ใช้ 2 ตัวแรก
    if (username.length > 1) {
      return username.substring(0, 2).toUpperCase();
    } 
    // ถ้ามีแค่ 1 ตัวอักษร ใช้ตัวนั้นซ้ำ 2 ครั้ง
    return username.substring(0, 1).toUpperCase().repeat(2);
  }
  
  // กรณีเป็นชื่อปกติ เอาเฉพาะ 2 ตัวอักษรแรกของชื่อ
  return name.substring(0, 2).toUpperCase();
};
</script>

<style scoped>
.user-dropdown {
  position: relative;
  display: inline-block;
}

.user-avatar-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--v-primary-base, #1976d2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 16px;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: var(--v-surface-base, white);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  margin-top: 8px;
}

.menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
}

/* Dark mode support */
:deep(.v-theme--dark) .user-menu {
  background-color: #1e1e1e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:deep(.v-theme--dark) .menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
