<script setup lang="ts">
import {computed, toRaw} from "vue";
import {t} from "@/language";
import {useDispatchSignal} from "@/hooks/useSignal";
import {useProjectConfig} from "@/store/modules/projectConfig";

const props = withDefaults(defineProps<{
  effectEnabled:boolean
}>(),{
  effectEnabled:false
})

const projectConfigStore = useProjectConfig();

const disabled = computed(() => !props.effectEnabled || !projectConfigStore.effect.UnrealBloom.enabled);

function handleUnrealBloomConfigChange(){
  useDispatchSignal("effectPassConfigChange","UnrealBloom",toRaw(projectConfigStore.effect.UnrealBloom));
}
</script>

<template>
  <div class="pass-config-item">
    <span>{{ t(`other.Enable`) }}</span>
    <div>
      <n-checkbox size="small" v-model:checked="projectConfigStore.effect.UnrealBloom.enabled" :disabled="!effectEnabled" @update:checked="handleUnrealBloomConfigChange"/>
    </div>
  </div>

  <!-- 光晕半径 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Radius`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.UnrealBloom.radius" :step="0.01" :min="0.00" :max="1.00" :disabled="disabled" @update:value="handleUnrealBloomConfigChange" />
    </div>
  </div>

  <!-- 光晕阈值 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Threshold`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.UnrealBloom.threshold" :step="0.01" :min="0.00" :max="1.00" :disabled="disabled" @update:value="handleUnrealBloomConfigChange" />
    </div>
  </div>

  <!-- 光晕强度 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Strength`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.UnrealBloom.strength" :step="0.01" :min="0.00" :max="3.00" :disabled="disabled" @update:value="handleUnrealBloomConfigChange" />
    </div>
  </div>
</template>

<style scoped lang="less">

</style>