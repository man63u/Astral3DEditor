<script lang="ts" setup>
import {onMounted, onBeforeUnmount, ref, nextTick} from 'vue';
import ViewPort from '@/cesium/viewPort';
import {useAddSignal,useRemoveSignal} from "@/hooks/useSignal";
import { useGlobalConfigStore } from '@/store/modules/globalConfig';

const globalConfigStore = useGlobalConfigStore();

let cesiumViewPort: any = null;
const cesiumRef = ref();


onMounted(async () => {
  await nextTick();

  cesiumViewPort = new ViewPort(cesiumRef.value);
})

onBeforeUnmount(() => {
  cesiumViewPort = null;
})
</script>

<template>
  <n-spin :show="globalConfigStore.loading">
    <div id="cesiumContainer" ref="cesiumRef" class="absolute top-0 left-0 w-full h-full"></div>

    <template #description>{{ globalConfigStore.loadingText }}</template>
  </n-spin>
</template>

<style lang="less" scoped>
#cesiumContainer {
  position: relative;
  overflow: hidden;

  /*设置cesium和three的画布位置*/
  :deep(canvas) {
    position: absolute;
    top: 0;

    /*three画布禁止鼠标操作*/
    &:nth-child(3) {
      pointer-events: none;
    }
  }

  :deep(.cesium-viewer) {
    position: absolute !important;
  }
}

.n-spin-container {
  width: 100%;
  height: calc(100% - 1.4rem - 1px);
  overflow: hidden;

  :deep(.n-spin-content) {
    width: 100%;
    height: 100%;
  }
}
</style>
