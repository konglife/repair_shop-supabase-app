<template>
  <v-card
    :loading="loading"
    :class="['base-card', { 'base-card--loading': loading }]"
    v-bind="$attrs"
  >
    <v-card-title v-if="$slots.title || title" class="base-card-title">
      <slot name="title">{{ title }}</slot>
      <slot name="title-actions"></slot>
    </v-card-title>
    
    <v-card-subtitle v-if="$slots.subtitle || subtitle" class="base-card-subtitle">
      <slot name="subtitle">{{ subtitle }}</slot>
    </v-card-subtitle>
    
    <v-card-text v-if="$slots.default">
      <slot></slot>
    </v-card-text>
    
    <template v-if="$slots.media">
      <slot name="media"></slot>
    </template>
    
    <v-divider v-if="$slots.actions"></v-divider>
    
    <v-card-actions v-if="$slots.actions" class="base-card-actions">
      <slot name="actions"></slot>
    </v-card-actions>
    
    <template v-if="loading && $slots['loading-overlay']">
      <slot name="loading-overlay"></slot>
    </template>
    <template v-else-if="loading">
      <div class="base-card-loading-overlay">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
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
  elevation: {
    type: [Number, String],
    default: 1
  }
});
</script>

<style lang="scss">
.base-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &--loading {
    pointer-events: none;
  }
  
  .base-card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    font-weight: 600;
  }
  
  .base-card-subtitle {
    padding: 0 24px 16px;
    opacity: 0.7;
  }
  
  .base-card-actions {
    padding: 16px 24px;
  }
  
  .v-card-text {
    padding: 24px;
  }
  
  .base-card-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }
}

/* Dark mode styles */
.v-theme--dark .base-card {
  background-color: #1E1E1E;
  
  .base-card-loading-overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

/* Light mode styles */
.v-theme--light .base-card {
  background-color: white;
  
  .base-card-loading-overlay {
    background-color: rgba(255, 255, 255, 0.7);
  }
}
</style>
