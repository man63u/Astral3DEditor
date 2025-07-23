<script lang="ts" setup>
import { ref, h, VNode, onMounted } from 'vue';
import { NForm, NFormItem, NCheckbox, NSelect, SelectOption, NTooltip } from 'naive-ui';
import * as THREE from "three";
import { useAddSignal, useDispatchSignal } from '@/hooks/useSignal';
import { t } from "@/language";
import { useProjectConfig } from "@/store/modules/projectConfig";
import EsInputNumber from '@/components/es/EsInputNumber.vue';

//编辑器渲染器在此创建
let currentRenderer: THREE.WebGLRenderer;

const projectConfigStore = useProjectConfig();

/* 渲染器设置项 */
//阴影选项
const shadowTypeOptions = ref([
    { label: "Basic", value: 0 },
    { label: "PCF", value: 1 },
    { label: "PCF Soft", value: 2 }
]);
//色调映射选项
const toneMappingOptions = ref([
    { label: "No", value: 0 },
    { label: "Linear", value: 1 },
    { label: "Reinhard", value: 2 },
    { label: "Cineon", value: 3 },
    { label: "ACESFilmic", value: 4 },
    { label: "AgX", value: 6 },
    { label: "Neutral", value: 7 },
]);
const renderToneMappingOption = ({ node, option }: { node: VNode; option: SelectOption }) => {
    return h(NTooltip, null, {
        trigger: () => node,
        default: () => option.label
    })
}

onMounted(() => {
    createRenderer();

    // 渲染器配置变更
    useAddSignal("rendererConfigUpdate", createRenderer);

    //场景清空时
    useAddSignal("editorCleared", () => {
        currentRenderer.shadowMap.enabled = true;
        currentRenderer.shadowMap.type = THREE.PCFShadowMap;
        currentRenderer.toneMapping = THREE.NoToneMapping;
        currentRenderer.toneMappingExposure = 1;

        projectConfigStore.renderer.shadows = currentRenderer.shadowMap.enabled;
        projectConfigStore.renderer.shadowType = currentRenderer.shadowMap.type;
        projectConfigStore.renderer.toneMapping = currentRenderer.toneMapping;
        projectConfigStore.renderer.toneMappingExposure = currentRenderer.toneMappingExposure;

        useDispatchSignal("rendererUpdated");
    })
})

function createRenderer() {
    // 判断是否支持WebGPU
    // if (WebGPU.isAvailable()) {
    //   console.log("使用WebGPU渲染器");
    //   currentRenderer = new WebGPURenderer({antialias: projectConfigStore.renderer.antialias});
    //   currentRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    //   currentRenderer.toneMappingExposure = 1;
    //   // @ts-ignore
    //   currentRenderer.useLegacyLights = false;
    // } else {
    currentRenderer = new THREE.WebGLRenderer({
        antialias: projectConfigStore.renderer.antialias,
        alpha: true,
        //TODO 想把canvas画布上内容下载到本地，需要设置为true。不清除画布缓存，费性能，SDK完善后设置为false
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
    });
    // }

    // 禁止自动清理渲染数据收集
    // currentRenderer.info.autoReset = false;

    currentRenderer.autoClear = false;
    currentRenderer.setClearColor(0x272727, 1);
    currentRenderer.outputColorSpace = THREE.SRGBColorSpace;
    // @ts-ignore
    currentRenderer.toneMapping = projectConfigStore.renderer.toneMapping;
    currentRenderer.toneMappingExposure = projectConfigStore.renderer.toneMappingExposure;
    currentRenderer.shadowMap.enabled = projectConfigStore.renderer.shadows;
    // @ts-ignore
    currentRenderer.shadowMap.type = projectConfigStore.renderer.shadowType;

    useDispatchSignal("rendererCreated", currentRenderer);
    useDispatchSignal("rendererUpdated");
}

function updateShadows() {
    currentRenderer.shadowMap.enabled = projectConfigStore.renderer.shadows;
    // @ts-ignore
    currentRenderer.shadowMap.type = projectConfigStore.renderer.shadowType;
    useDispatchSignal("rendererUpdated");
}

function updateToneMapping() {
    // @ts-ignore
    currentRenderer.toneMapping = projectConfigStore.renderer.toneMapping;
    currentRenderer.toneMappingExposure = projectConfigStore.renderer.toneMappingExposure;
    useDispatchSignal("rendererUpdated");
}
</script>

<template>
    <n-form label-placement="left" :label-width="90" label-align="left" size="small">
        <n-form-item :label="t('layout.sider.project.antialias')">
            <n-checkbox v-model:checked="projectConfigStore.renderer.antialias"
                @update:checked="createRenderer"></n-checkbox>
        </n-form-item>
        <n-form-item :label="t('layout.sider.project.shadows')">
            <n-checkbox v-model:checked="projectConfigStore.renderer.shadows"
                @update:checked="updateShadows"></n-checkbox>
            <n-select v-model:value="projectConfigStore.renderer.shadowType" :options="shadowTypeOptions" class="ml-1"
                @update:value="updateShadows" />
        </n-form-item>
        <n-form-item :label="t('layout.sider.project[\'tone mapping\']')">
            <n-select v-model:value="projectConfigStore.renderer.toneMapping" :options="toneMappingOptions" class="ml-1"
                :render-option="renderToneMappingOption" @update:value="updateToneMapping" />
            <EsInputNumber v-if="projectConfigStore.renderer.toneMapping !== 0"
                v-model:value="projectConfigStore.renderer.toneMappingExposure" :min="0.00" size="tiny" :step="0.01"
                :show-button="false" class="ml-1 w-100px" @change="updateToneMapping" />
        </n-form-item>
    </n-form>
</template>