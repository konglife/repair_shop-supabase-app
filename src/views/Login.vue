<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  try {
    await authStore.signInWithPassword(email.value, password.value);
    // Redirect to home or dashboard after successful login
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed';
  }
};
</script>

<template>
  <v-container fluid class="fill-height bg-surface">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="pa-4 rounded-lg" elevation="3">
          <v-card-title class="text-h5 font-weight-bold pb-2">เข้าสู่ระบบ</v-card-title>

          <v-form @submit.prevent="handleLogin" class="mt-4">
            <v-text-field
              v-model="email"
              label="อีเมล"
              type="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              required
              :rules="[v => !!v || 'กรุณากรอกอีเมล']"
              placeholder="กรอกอีเมลของคุณ"
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="password"
              label="รหัสผ่าน"
              type="password"
              prepend-inner-icon="mdi-lock"
              variant="outlined"
              required
              :rules="[v => !!v || 'กรุณากรอกรหัสผ่าน']"
              placeholder="กรอกรหัสผ่านของคุณ"
              class="mb-4"
            ></v-text-field>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
            >
              {{ errorMessage }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              block
              :loading="authStore.loading"
              :disabled="authStore.loading"
              class="mt-2 mb-4"
              rounded="lg"
            >
              {{ authStore.loading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ' }}
            </v-btn>
            
            <div class="d-flex align-center justify-center mt-2">
              <span class="text-medium-emphasis text-body-2">
                ยังไม่มีบัญชี? 
              </span>
              <v-btn
                variant="text"
                color="primary"
                density="comfortable"
                class="ml-1"
                to="/signup"
              >
                สมัครสมาชิกที่นี่
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- ไม่จำเป็นต้องมี <style> -->
