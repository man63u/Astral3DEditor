declare interface ICesiumConfig{
    token:"",
    mapType:'satellite' | 'vector',
    map:"Amap" | "Tianditu",
    // 是否需要标记图
    markMap:boolean,
    // 底图是天地图时的天地图密匙
    tiandituTk:string
}

declare interface ISceneFetchData {
    id:string, // 场景id，使用uuid
    exampleSceneId?:string, // 所使用的示例场景id
    sceneType:string, // 场景分类  城市、园区、工厂、楼宇、设备、其他...
    sceneName:string,
    sceneIntroduction:string, // 场景描述
    sceneVersion:number, // 场景版本
    projectType:number, // 项目类型。0：Web3D-THREE  1：WebGIS-Cesium
    coverPicture:string, // 保存场景时自动生成的封面图url
    hasDrawing:number, // 场景是否包含图纸 0:false  1:true
    zip:string, // 场景zip包地址
    zipSize:string, // 场景zip包大小
    cesiumConfig?:ICesiumConfig | string, // WebGIS-Cesium 类型项目的基础Cesium配置,JSON字符串
    createTime?:string,
    updateTime?:string,
}

// 项目配置
declare interface IConfigJson {
    xr: boolean,
    renderer: {
        antialias: boolean,
        shadows: boolean,
        shadowType: import("three").ShadowMapType,
        toneMapping: import("three").ToneMapping,
        toneMappingExposure: number
    },
    effect: {
        enabled: boolean,
        Outline: {
            enabled: boolean,
            edgeStrength: number,
            edgeGlow: number,
            edgeThickness: number,
            pulsePeriod: number,
            usePatternTexture: boolean,
            visibleEdgeColor: number | string,
            hiddenEdgeColor: number | string,
        },
        FXAA: {
            enabled: boolean,
        },
        UnrealBloom: {
            enabled: boolean,
            strength: number,
            radius: number,
            threshold: number,
        },
        Bokeh: {
            enabled: boolean,
            focus: number,
            aperture: number,
            maxblur: number,
        },
        Pixelate?: {
            enabled: boolean,
            pixelSize: number,
            normalEdgeStrength: number,
            depthEdgeStrength: number,
        },
        Halftone: {
            enabled: boolean,
            shape: number,
            radius: number,
            rotateR: number,
            rotateG: number,
            rotateB: number,
            scatter: number,
            blending: number,
            blendingMode: number,
            greyscale: boolean,
        }
    }
}

declare interface ISceneJson {
    metadata:{},
    "camera": {
        "metadata": {
            "version": number,
            "type": "Object",
            "generator": "Object3D.toJSON"
        },
        "object": {
            "uuid": string,
            "type": "PerspectiveCamera",
            "name": string,
            "layers": number,
            "matrix": number[],
            "up": [0|1, 0|1, 0|1],
            "fov": number,
            "zoom": number,
            "near": number,
            "far": number,
            "focus": number,
            "aspect": number,
            "filmGauge": number,
            "filmOffset": number
        }
    },
    "scene": {
        "uuid": string,
        "metadata": {
            "version": number,
            "type": "Object",
            "generator": "Object3D.toJSON"
        },
        "textures": Array<import('three').Texture>,
        "images": string[],
        "object": {
            "uuid": string,
            "type": "Scene",
            "name": string,
            "layers": number,
            "matrix": number[],
            "up": [0|1, 0|1, 0|1],
            "background": string,
            "environment": string,
            "backgroundRotation": [number,number,number,string],
            "environmentRotation": [number,number,number,string],
            "children": Array<string>
        },
        "geometries"?: Array<any>,
        groupChildren?: Array<string>
    },
    "scripts": {
        [uuid:string]: [
            {
                "name": string,
                "source": string
            }
        ]
    },
    "controls": {
        state: string
    },
    "totalZipNumber": number,
    "sceneInfo": ISceneFetchData,
    drawingInfo?: {
        imgSrc: string;
        markList: any[];
        imgInfo: {};
    }
}

declare interface IFromJSONResult {
    initCamera:import("three").PerspectiveCamera,
}