<template>
  <div class="form-field">
    <label :for="id">{{ label }}</label>
    <select v-model="model" :id="id">
      <option v-for="value in options" :key="value" :value="value">
        {{ value }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const model = defineModel();
defineProps<{
  id: string;
  options: Array<string>;
  label: string;
}>();
</script>
