import {defineStore} from "pinia";
import { store } from '@/store';

const DefaultProjectConfig:IConfigJson = {
    // 项目运行是否启用xr
    xr: false,
    // 渲染器相关配置
    renderer: {
        antialias: true,
        shadows: true,
        shadowType: 1, // PCF
        toneMapping: 0, // NoToneMapping
        toneMappingExposure: 1,
    },
    // 后处理
    effect: {
        enabled: true,
        // 描边线
        Outline: {
            enabled: true,
            // 边缘的强度，值越高边框范围越大
            edgeStrength: Number(3.0),
            // 发光强度
            edgeGlow: Number(0.2),
            // 边缘浓度
            edgeThickness: Number(1.0),
            // 闪烁频率，值越大频率越低
            pulsePeriod: Number(0.0),
            // 禁用纹理以获得纯线的效果
            usePatternTexture: false,
            // 可见边缘的颜色
            visibleEdgeColor: "#ffee00",
            // 不可见边缘的颜色
            hiddenEdgeColor: "#ff6a00"
        },
        // 抗锯齿
        FXAA: {
            enabled: true,
        },
        // 辉光
        UnrealBloom: {
            enabled: false,
            // 光晕阈值，值越小，效果越明显
            threshold: 0,
            // 光晕强度
            strength: 1,
            // 光晕半径
            radius: 0
        },
        // 背景虚化
        Bokeh: {
            enabled: false,
            // 焦距，调整远近，对焦时才会清晰
            focus: 500.0,
            // 孔径，类似相机孔径调节
            aperture: 0.00005,
            // 最大模糊程度
            maxblur: 0.01
        },
        // 像素风
        Pixelate: {
            enabled: false,
            // 像素大小
            pixelSize: 6,
            // 法向边缘强度
            normalEdgeStrength: 0.3,
            // 深度边缘强度
            depthEdgeStrength: 0.4,
        },
        // 半色调
        Halftone: {
            enabled: false,
            // 形状：点，椭圆，线，正方形
            shape: 1,
            // 半径
            radius: 4,
            // R色旋转
            rotateR: Math.PI / 12,
            // G色旋转
            rotateG: Math.PI / 12 * 2,
            // B色旋转
            rotateB: Math.PI / 12 * 3,
            // 分散度
            scatter: 0,
            // 混合度
            blending: 1,
            // 混合模式：线性，相乘，相加，明亮，昏暗
            blendingMode: 1,
            // 灰度
            greyscale: false,
        }
    }
}

export const useProjectConfig = defineStore('projectConfig', {
    state: () => (DefaultProjectConfig),
    getters: {
        // getXR: (state) => state.xr,
    },
    actions: {
        /**
         * 获取渲染器配置
         * @param {string} key
         */
        getRendererItem(key: string) {
            return this.renderer[key];
        },
        /**
         * 设置渲染器配置
         * @param {string} key
         * @param {any} value
         */
        setRendererItem(key: string, value: any) {
            this.renderer[key] = value;
        },
        /**
         * 获取后处理配置
         * @param {string} key
         */
        getEffectItem(key: string) {
            return this.effect[key];
        },
        /**
         * 设置后处理配置
         * @param {string} key
         * @param {any} value
         */
        setEffectItem(key: string, value: any) {
            this.effect[key] = value;
        }
    }
});

// setup 之外使用
export function useProjectConfigStoreWithOut() {
    return useProjectConfig(store);
}