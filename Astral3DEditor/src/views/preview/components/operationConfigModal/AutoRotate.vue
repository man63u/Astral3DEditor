<script setup lang="ts">
import { ref, watch } from 'vue';
import {t} from "@/language";
import { usePreviewOperationStore } from "@/store/modules/previewOperation";

const operationStore = usePreviewOperationStore();

const showModal = ref(false);

watch(() => operationStore.menuList.autoRotate.active, (newVal) => {
  if(newVal){
    showModal.value = true;
  }
})

function handleClose(){
  showModal.value = false;
}
</script>

<template>
  <n-card v-if="showModal" :title="t('preview.Auto rotation')" closable @close="handleClose" size="small" :segmented="{
      content: true,
      footer: 'soft',
    }">
    <div class="flex w-full">
      <span class="w-30%">{{ t("preview.Rotational speed") }}</span>
      <n-slider v-model:value="operationStore.autoRotateSpeed" show-tooltip :step="1" :min="1" :max="100"
                class="w-70%" />
    </div>
  </n-card>
</template>

<style scoped lang="less">

</style>