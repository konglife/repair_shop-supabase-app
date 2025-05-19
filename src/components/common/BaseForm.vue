<template>
  <v-form
    ref="form"
    v-model="isValid"
    @submit.prevent="handleSubmit"
    class="base-form"
  >
    <v-card
      :loading="loading"
      :class="['base-form-card', { 'base-form-card--loading': loading }]"
    >
      <v-card-title v-if="title" class="base-form-title">
        {{ title }}
        <slot name="title-append"></slot>
      </v-card-title>
      
      <v-card-subtitle v-if="subtitle" class="base-form-subtitle">
        {{ subtitle }}
      </v-card-subtitle>
      
      <v-card-text>
        <slot></slot>
      </v-card-text>
      
      <v-divider v-if="$slots.actions"></v-divider>
      
      <v-card-actions v-if="$slots.actions" class="base-form-actions">
        <slot name="actions" :is-valid="isValid" :is-submitting="loading">
          <v-spacer></v-spacer>
          <v-btn
            v-if="showCancel"
            variant="outlined"
            color="grey"
            @click="$emit('cancel')"
            :disabled="loading"
            class="base-form-cancel-btn"
          >
            {{ cancelText }}
          </v-btn>
          <v-btn
            type="submit"
            color="primary"
            :disabled="!isValid || loading"
            :loading="loading"
            class="base-form-submit-btn ml-3"
          >
            {{ submitText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: 'บันทึก'
  },
  cancelText: {
    type: String,
    default: 'ยกเลิก'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'cancel', 'update:model-value', 'validation-change']);

// ระบุ type ของ form ให้ชัดเจน
interface VForm {
  reset: () => void;
  validate: () => Promise<{ valid: boolean; errors: any[] }>;
}

const form = ref<VForm | null>(null);
const isValid = ref(false);

watch(isValid, (newValue) => {
  emit('validation-change', newValue);
});

const handleSubmit = () => {
  if (isValid.value && !props.loading) {
    emit('submit');
  }
};

const reset = () => {
  if (form.value) {
    form.value.reset();
  }
};

const validate = async () => {
  if (form.value) {
    return await form.value.validate();
  }
  return { valid: false, errors: [] };
};

// Expose methods to parent component
defineExpose({
  reset,
  validate,
  form
});
</script>

<style lang="scss">
.base-form {
  width: 100%;
  
  .base-form-card {
    border-radius: 16px;
    transition: all 0.3s ease;
    
    &--loading {
      opacity: 0.7;
    }
  }
  
  .base-form-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    font-weight: 600;
  }
  
  .base-form-subtitle {
    padding: 0 24px 16px;
    opacity: 0.7;
  }
  
  .base-form-actions {
    padding: 16px 24px;
  }
  
  .v-card-text {
    padding: 24px;
  }
}

/* Dark mode styles */
.v-theme--dark .base-form-card {
  background-color: #1E1E1E;
}

/* Light mode styles */
.v-theme--light .base-form-card {
  background-color: white;
}
</style>
