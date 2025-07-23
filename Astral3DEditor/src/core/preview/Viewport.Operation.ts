import * as THREE from "three";
import { Viewport } from "./Viewport";
import { useDispatchSignal } from "@/hooks/useSignal";
import { t } from "@/language";
import { MenuOperation } from "@/utils/preview/menuOperation";

let roamPdFn, pointerlockFn;

export class ViewportOperation {
    viewport: Viewport;

    // 初始化控制器状态
    initControlsState: string = "{}";
    // 漫游模式下，上次退出时相机位置
    lastRoadCameraPos = new THREE.Vector3();

    constructor(viewport: Viewport) {
        this.viewport = viewport;
    }

    /**
     * 还原视角
     */
    resetCameraView() {
        if (this.initControlsState === "{}") return;

        this.viewport.modules.controls.fromJSON(this.initControlsState, true);
    }

    /* 选点漫游 */
    enterRoaming() {
        window.$message?.info(t("preview.Please select initial position"));

        const canvas = this.viewport.renderer.domElement;

        const handlePointerDown = (e: MouseEvent) => {
            const raycaster = new THREE.Raycaster();

            const x = e.offsetX;
            const y = e.offsetY;
            const mouse = new THREE.Vector2();
            mouse.x = (x / canvas.offsetWidth) * 2 - 1;
            mouse.y = -(y / canvas.offsetHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.viewport.camera);
            raycaster.firstHitOnly = true;

            let intersects = raycaster.intersectObject(this.viewport.modules.roaming.group, true) || [];
            if (intersects && intersects.length > 0) {
                const intersect = intersects[0];

                // 锁定鼠标指针
                this.viewport.modules.controls.lockPointer();

                canvas.removeEventListener("pointerdown", roamPdFn);
                roamPdFn = undefined;

                this.lastRoadCameraPos.copy(this.viewport.camera.position);

                const point = new THREE.Vector3(intersect.point.x, intersect.point.y + 2, intersect.point.z);
                this.viewport.modules.roaming.playerInitPos.copy(point);

                this.viewport.modules.roaming.startRoaming();

                // 第三人称
                this.viewport.modules.controls.maxPolarAngle = Math.PI / 2;
                this.viewport.modules.controls.minDistance = 0.8;
                this.viewport.modules.controls.maxDistance = 0.8;
                this.viewport.modules.controls.distance = 0.8;

                useDispatchSignal("sceneGraphChanged");
            }
            return null;
        }

        pointerlockFn = () => {
            if (document.pointerLockElement) {
                // console.log("指针被锁定到：", document.pointerLockElement);
            } else {
                // console.log("指针锁定状态现已解锁");
                MenuOperation.roaming();
            }
        }
        // 监听鼠标锁定取消
        document.addEventListener("pointerlockchange", pointerlockFn);

        // 监听选取初始位置
        roamPdFn = handlePointerDown.bind(this);
        canvas.addEventListener("pointerdown", roamPdFn);
    }

    /* 退出漫游 */
    leaveRoaming() {
        this.viewport.modules.roaming.exitRoaming(this.lastRoadCameraPos);

        if (roamPdFn) {
            this.viewport.renderer.domElement.removeEventListener("pointerdown", roamPdFn);
            roamPdFn = null;
        }

        if (pointerlockFn) {
            document.removeEventListener("pointerlockchange", pointerlockFn);
            pointerlockFn = null;
        }
    }
}