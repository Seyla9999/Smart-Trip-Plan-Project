<template>
  <button
    type="button"
    :class="['common-button-light', `property-${property1}`, divClassName]"
  >
    <span class="common-button-light__label">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
    property1?: 'default' | 'hover'
    divClassName?: string
  }>(),
  {
    text: 'Button',
    property1: 'default',
    divClassName: '',
  }
)
</script>

<style scoped>
.common-button-light {
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.common-button-light:hover,
.common-button-light.property-hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.75);
  transform: translateY(-1px);
}

.common-button-light__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: inherit;
}
</style>