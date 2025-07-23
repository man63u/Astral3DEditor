import { useAddSignal } from "@/hooks/useSignal";
import { ViewportEffect } from "@/core/Viewport.Effect";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import * as THREE from "three";

export class ViewportSignals {
    private viewport: any;

    constructor(viewport) {
        this.viewport = viewport;

        this.init();
    }

    init() {
        useAddSignal("sceneGraphChanged", this.sceneGraphChanged.bind(this));
        useAddSignal("objectSelected", this.objectSelected.bind(this));
        useAddSignal("sceneResize", this.sceneResize.bind(this));
    }

    /**
     * 判断对象是否是可射线选中的
     */
    objectIsCanPick(object: THREE.Object3D) {
        return object !== null && object !== this.viewport.scene && object !== this.viewport.camera;
    }

    /**
     * 手动场景渲染
     */
    sceneGraphChanged() {
        this.viewport.render();
    }

    /**
     * 选中模型
     * @param object
     */
    objectSelected(object) {
        this.viewport.selectionBox.visible = false;
        this.viewport.modules.effect.outlinePass.selectedObjects = [];

        // 漫游模式下不选中
        if (this.viewport.modules.roaming?.isRoaming) return;

        if (this.objectIsCanPick(object)) {
            if (this.viewport.modules.effect.enabled) {
                this.viewport.modules.effect.outlinePass.selectedObjects = [object];
            } else {
                this.viewport.box.setFromObject(object, true);
                if (this.viewport.box.isEmpty() === false) {
                    this.viewport.selectionBox.visible = true;
                }
            }

            // 相机飞行
            this.objectFocused(object)
        }
    }

    /**
     * 聚焦模型
     * @param object
     */
    objectFocused(object) {
        const box3 = new THREE.Box3();
        box3.setFromObject(object);

        if (box3.isEmpty()) {
            box3.set(new THREE.Vector3(object.position.x - 1, object.position.y - 1, object.position.z - 1), new THREE.Vector3(object.position.x + 1, object.position.y + 1, object.position.z + 1));
        }
        this.viewport.modules.controls.fitToBox(box3, true,{
            cover:false,
            paddingTop:3,
            paddingBottom:3,
            paddingLeft:3,
            paddingRight:3,
        });
    }

    sceneResize() {
        if (this.viewport.camera) {
            this.viewport.camera.aspect = this.viewport.container.offsetWidth / this.viewport.container.offsetHeight;
            this.viewport.camera.updateProjectionMatrix();
        }

        this.viewport.renderer.setSize(this.viewport.container.offsetWidth, this.viewport.container.offsetHeight);
        if (this.viewport.modules.effect.enabled) {
            this.viewport.modules.effect.composer.setSize(this.viewport.container.offsetWidth, this.viewport.container.offsetHeight);
            if (ViewportEffect.PassMap.has("FXAA")) {
                const FXAA = ViewportEffect.PassMap.get("FXAA") as ShaderPass;
                const pixelRatio = this.viewport.renderer.getPixelRatio();
                FXAA.material.uniforms['resolution'].value.x = 1 / (this.viewport.container.offsetWidth * pixelRatio);
                FXAA.material.uniforms['resolution'].value.y = 1 / (this.viewport.container.offsetHeight * pixelRatio);
            }
        }

        if (this.viewport.css2DRenderer) {
            this.viewport.css2DRenderer.setSize(this.viewport.container.offsetWidth, this.viewport.container.offsetHeight);
        }
        if (this.viewport.css3DRenderer){
            this.viewport.css3DRenderer.setSize(this.viewport.container.offsetWidth, this.viewport.container.offsetHeight);
        }
        
        this.viewport.render();
    };

    dispose() { }
}