<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../supabaseClient';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

// Form validation rules
const emailRules = [
  (v: string) => !!v || 'กรุณากรอกอีเมล',
  (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'รูปแบบอีเมลไม่ถูกต้อง',
];
const passwordRules = [
  (v: string) => !!v || 'กรุณากรอกรหัสผ่าน',
  (v: string) => v.length >= 6 || 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
];
const confirmPasswordRules = [
  (v: string) => !!v || 'กรุณายืนยันรหัสผ่าน',
  (v: string) => v === password.value || 'รหัสผ่านไม่ตรงกัน',
];

const formValid = ref(true);

const handleSignup = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  
  if (!formValid.value) {
    return;
  }
  
  loading.value = true;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (error) {
      errorMessage.value = error.message;
    } else if (data.user) {
      successMessage.value = 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี';
      // Reset form after successful signup
      email.value = '';
      password.value = '';
      confirmPassword.value = '';
      // Could add automatic redirect after a delay
      // setTimeout(() => router.push('/login'), 5000);
    } else {
      // This case might happen if email confirmation is required but no user object is returned immediately
      successMessage.value = 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี';
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'การสมัครสมาชิกล้มเหลว';
  } finally {
    loading.value = false;
  }
};

const navigateToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <v-container fluid class="fill-height bg-surface">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="pa-4 rounded-lg" elevation="3">
          <v-card-title class="text-h5 font-weight-bold pb-2">สมัครสมาชิก</v-card-title>
          <p class="text-subtitle-2 text-medium-emphasis mb-4">กรุณากรอกข้อมูลเพื่อสร้างบัญชีใหม่</p>

          <v-form @submit.prevent="handleSignup" v-model="formValid" class="mt-4">
            <v-text-field
              v-model="email"
              label="อีเมล"
              type="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              required
              :rules="emailRules"
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
              :rules="passwordRules"
              placeholder="กรอกรหัสผ่านของคุณ"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="confirmPassword"
              label="ยืนยันรหัสผ่าน"
              type="password"
              prepend-inner-icon="mdi-lock-check"
              variant="outlined"
              required
              :rules="confirmPasswordRules"
              placeholder="ยืนยันรหัสผ่านของคุณ"
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

            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-4"
              closable
            >
              {{ successMessage }}
            </v-alert>

            <v-btn
              type="submit"
              color="success"
              block
              :loading="loading"
              :disabled="loading || !formValid"
              class="mt-2 mb-4"
              rounded="lg"
            >
              {{ loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก' }}
            </v-btn>
            
            <div class="d-flex align-center justify-center mt-2">
              <span class="text-medium-emphasis text-body-2">
                มีบัญชีอยู่แล้ว? 
              </span>
              <v-btn
                variant="text"
                color="primary"
                density="comfortable"
                class="ml-1"
                @click="navigateToLogin"
              >
                เข้าสู่ระบบที่นี่
              </v-btn>
            </div>
            
            <p class="text-caption text-medium-emphasis text-center mt-4">
              การสมัครสมาชิกถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขการใช้งานของเรา
            </p>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- ไม่จำเป็นต้องมี <style> -->
