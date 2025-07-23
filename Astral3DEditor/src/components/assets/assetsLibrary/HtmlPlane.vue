<template>
    <div id="assets-library-html-plane">
        <div class="cards">
            <n-card size="small" hoverable v-for="item in allList" :key="item.key" @click="addToScene(item)" draggable="true" @dragstart="dragStart(item)" @dragend="dragEnd">
                <template #cover>
                    <img :src="item.image" :alt="item.key" draggable="false" />
                </template>
                <n-tooltip placement="bottom" trigger="hover">
                    <template #trigger> {{ item.name.value || item.name }}</template>
                    <span> {{ item.name.value || item.name }} </span>
                </n-tooltip>
            </n-card>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, toRaw } from "vue";
import { t,cpt } from "@/language";
import { useDragStore } from "@/store/modules/drag";
import { screenToWorld } from "@/utils/common/scenes";
import { AddObjectCommand } from "@/core/commands/AddObjectCommand";
import { HtmlPlaneConverter } from "@/core/objects/HtmlPlane";

const allList = [
    { key: "Factory equipment", image: "/static/images/assetsLibrary/htmlPlane/factoryEquipment.png", name: cpt("layout.sider.htmlPlane.Factory equipment"), html: "/static/resource/htmlPlane/factoryEquipment.html" },
];

//双击添加至场景..
function addToScene(item, position?: number[]) {
    HtmlPlaneConverter.getInstance().loadAsync({
        url: item.html,
        isSprite: true
    }).then(htmlPlaneObj => {
        if (!position) {
            position = [0, 0, 0];
        }
        htmlPlaneObj.position.fromArray(position);
        htmlPlaneObj.scale.set(0.1, 0.1, 1);
        htmlPlaneObj.name = item.name.value || item.name;
        window.editor.execute(new AddObjectCommand(htmlPlaneObj), `Add Billboard: ${htmlPlaneObj.name}`);
    });
}

// 开始拖拽事件
const dragStore = useDragStore();

function dragStart(item) {
    dragStore.setData(item)
}

function dragEnd() {
    if (dragStore.getActionTarget !== "addToScene" || dragStore.endArea !== "Scene") return;

    const position = screenToWorld(dragStore.endPosition.x, dragStore.endPosition.y);

    addToScene(dragStore.getData, position.toArray());

    dragStore.setActionTarget("");
}
</script>

<style scoped lang="less">
#assets-library-html-plane {
    overflow-x: hidden;

    .cards {
        padding: 0 10px 10px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 10px 8px;
    }

    .n-card {
        cursor: pointer;

        .n-image {
            display: block;
        }

        :deep(.n-card-cover) {
            img {
                height: 85px;
            }
        }

        :deep(.n-card__content) {
            padding: 3px 0;
            font-size: 13px;
            text-align: center;
        }
    }
}
</style>
