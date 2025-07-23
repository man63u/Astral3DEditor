/**
 * 扩展three.js类型声明
 */
import * as THREE from 'three';

declare module 'three' {
    interface Object3D {
        // 是否被忽略，仅用于显示（选中、场景树、打包等都会忽略）
        ignore?: boolean;

        // 元数据
        metaData: {
            material?: string | Array<string> | THREE.Material
        };

        traverseByCondition(callback: (Object3D) => void, condition: (Object3D) => boolean):void;

        /* 以下补充THREE.Object3D自身缺少的声明 */
        isInstancedMesh?: boolean;
        count?:number;
        instanceMatrix?: THREE.InstancedBufferAttribute;
        instanceColor?:THREE.Color;
        isBatchedMesh?:boolean;
        perObjectFrustumCulled?:boolean;
        sortObjects?:boolean;
        _drawRanges?:any;
        _reservedRanges?:any;
        _visibility?: boolean;
        _active?: boolean;
        _bounds?: any;
        _maxInstanceCount?: number;
        _maxVertexCount?: number;
        _maxIndexCount?: number;
        _geometryInitialized?: boolean;
        _geometryCount?: number;
        _matricesTexture?: THREE.Texture;
        _colorsTexture?: THREE.Texture;
        boundingSphere?: THREE.Sphere;
        boundingBox?: THREE.Box3;
        isScene?: boolean;
        material?: THREE.Material;
    }

    interface Material {
        // 从另一个材质中复制相同的属性（材质类型可能不同）
        copyAttr(source:THREE.Material):void;
    }
}