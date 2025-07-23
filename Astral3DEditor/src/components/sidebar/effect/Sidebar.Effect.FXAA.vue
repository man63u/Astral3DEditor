<script setup lang="ts">
import {reactive,toRaw } from "vue";
import {t} from "@/language";
import {useDispatchSignal} from "@/hooks/useSignal";
import {useProjectConfig} from "@/store/modules/projectConfig";

withDefaults(defineProps<{
  effectEnabled:boolean
}>(),{
  effectEnabled:false
})

const projectConfigStore = useProjectConfig();

function handleFXAAConfigChange(){
  useDispatchSignal("effectPassConfigChange","FXAA",toRaw(projectConfigStore.effect.FXAA));
}
</script>

<template>
  <div class="pass-config-item">
    <span>{{ t(`other.Enable`) }}</span>
    <div>
      <n-checkbox size="small" v-model:checked="projectConfigStore.effect.FXAA.enabled" :disabled="!effectEnabled" @update:checked="handleFXAAConfigChange"/>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>