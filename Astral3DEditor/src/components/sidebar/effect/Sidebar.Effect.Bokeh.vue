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

const disabled = computed(() => !props.effectEnabled || !projectConfigStore.effect.Bokeh.enabled);

function handleBokehConfigChange(){
  useDispatchSignal("effectPassConfigChange","Bokeh",toRaw(projectConfigStore.effect.Bokeh));
}
</script>

<template>
  <div class="pass-config-item">
    <span>{{ t(`other.Enable`) }}</span>
    <div>
      <n-checkbox size="small" v-model:checked="projectConfigStore.effect.Bokeh.enabled" :disabled="!effectEnabled" @update:checked="handleBokehConfigChange"/>
    </div>
  </div>

  <!-- 焦距 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Focus`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.Bokeh.focus" :step="10" :min="10" :max="3000" :disabled="disabled" @update:value="handleBokehConfigChange" />
    </div>
  </div>

  <!-- 孔径 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.Aperture`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.Bokeh.aperture" :step="0.000001" :min="0" :max="0.0001" :disabled="disabled"
                @update:value="handleBokehConfigChange" :format-tooltip="(value: number) => `${value * 10000}`" />
    </div>
  </div>

  <!-- 最大模糊 -->
  <div class="pass-config-item">
    <span>{{ t(`layout.sider.postProcessing.MaxBlur`) }}</span>
    <div>
      <n-slider v-model:value="projectConfigStore.effect.Bokeh.maxblur" :step="0.001" :min="0.0" :max="0.01" :disabled="disabled" @update:value="handleBokehConfigChange" />
    </div>
  </div>
</template>

<style scoped lang="less">

</style>