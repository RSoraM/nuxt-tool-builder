<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <select class="select select-bordered select-xs w-40">
        <option>
        </option>
      </select>
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <!-- <ATFNode  /> -->

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

// 当前组件是错误的实现

</script>
