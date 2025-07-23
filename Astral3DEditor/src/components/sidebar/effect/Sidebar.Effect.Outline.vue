<script setup lang="ts">
import {computed, reactive, toRaw} from "vue";
import {t} from "@/language";
import {useDispatchSignal} from "@/hooks/useSignal";
import {useProjectConfig} from "@/store/modules/projectConfig";

const props = withDefaults(defineProps<{
  effectEnabled:boolean
}>(),{
  effectEnabled:false
})

const projectConfigStore = useProjectConfig();

const disabled = computed(() => !props.effectEnabled || !projectConfigStore.effect.Outline.enabled);

function handleOutlineConfigChange(){
  useDispatchSignal("effectPassConfigChange","Outline",toRaw(projectConfigStore.effect.Outline));
}
</script>

<template>
  <div class="pass-config-item">
    <span>{{ t(`other.Enable`) }}</span>
    <div>
      <n-checkbox size="small" v-model:checked="projectConfigStore.effect.Outline.enabled" :disabled="!effectEnabled" @update:checked="handleOutlineConfigChange"/>
    </div>
  </div>

  <!-- 边缘强度 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Edge Strength`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.Outline.edgeStrength" :step="0.01" :min="0.01" :max="10" :disabled="disabled" @update:value="handleOutlineConfigChange" />
    </div>
  </div>

  <!-- 边缘发光 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Edge Glow`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.Outline.edgeGlow" :step="0.01" :min="0" :max="1" :disabled="disabled" @update:value="handleOutlineConfigChange" />
    </div>
  </div>

  <!-- 边缘厚度 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Edge Thickness`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.Outline.edgeThickness" :step="0.01" :min="1" :max="4" :disabled="disabled" @update:value="handleOutlineConfigChange" />
    </div>
  </div>

  <!-- 闪烁频率 -->
  <!--      <div class="pass-config-item">-->
  <!--        <span>{{ t(`layout.sider.postProcessing.Pulse Period`) }}</span>-->
  <!--        <div>-->
  <!--          <n-slider v-model:value="projectConfigStore.effect.Outline.pulsePeriod" :step="0.01" :min="0" :max="5" :disabled="disabled" @update:value="handleOutlineConfigChange" />-->
  <!--        </div>-->
  <!--      </div>-->

  <!-- 可见边缘的颜色 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Visible Edge`) }}</span>
    <div>
      <n-color-picker :show-alpha="false" v-model:value="projectConfigStore.effect.Outline.visibleEdgeColor" :disabled="disabled" @update:value="handleOutlineConfigChange" />
    </div>
  </div>

  <!-- 不可见边缘的颜色 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Hidden Edge`) }}</span>
    <div>
      <n-color-picker :show-alpha="false" v-model:value="projectConfigStore.effect.Outline.hiddenEdgeColor" :disabled="disabled" @update:value="handleOutlineConfigChange" />
    </div>
  </div>
</template>

<style scoped lang="less">

</style>