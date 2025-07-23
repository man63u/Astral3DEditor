<template>
    <div class="absolute left-10px bottom-10px color-white text-12px">
        <span class="ml-6px">{{ t("layout.scene.viewportInfo.Objects") }}: {{ objectsText }}</span>
        <span class="ml-6px">{{ t("layout.scene.viewportInfo.Vertices") }}: {{ verticesText }}</span>
        <span class="ml-6px">{{ t("layout.scene.viewportInfo.Triangles") }}: {{ trianglesText }}</span>
        <span class="ml-6px">{{ t("layout.scene.viewportInfo.Frame time") }}: {{ frameTimeText }}</span>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAddSignal, useRemoveSignal } from "@/hooks/useSignal";
import { t } from "@/language";

const objectsText = ref("0");
const verticesText = ref("0");
const trianglesText = ref("0");
const frameTimeText = ref("0 ms");

onMounted(() => {
    useAddSignal("objectAdded", update);
    useAddSignal("objectRemoved", update);
    useAddSignal("geometryChanged", update);
    useAddSignal("sceneRendered", updateFrameTime);
})
onBeforeUnmount(() => {
    useRemoveSignal("objectAdded", update);
    useRemoveSignal("objectRemoved", update);
    useRemoveSignal("geometryChanged", update);
    useRemoveSignal("sceneRendered", updateFrameTime);
})

function update() {
    const scene = window.editor.scene;
    let objects = 0, vertices = 0, triangles = 0;
    for (let i = 0, l = scene.children.length; i < l; i++) {
        const object = scene.children[i];
        object.traverseByCondition((object) => {
            objects++;
            if (object.isMesh || object.isPoints) {
                const geometry = object.geometry;
                vertices += geometry.attributes.position.count;
                if (object.isMesh) {
                    if (geometry.index !== null) {
                        triangles += geometry.index.count / 3;
                    } else {
                        triangles += geometry.attributes.position.count / 3;
                    }
                }
            }
        }, (c) => {
            return !c.ignore;
        });
    }

    objectsText.value = objects.format();
    verticesText.value = vertices.format();
    trianglesText.value = triangles.format();
}

function updateFrameTime(frameTime: string) {
    frameTimeText.value = Number(frameTime).toFixed(2) + ' ms';
}
</script>