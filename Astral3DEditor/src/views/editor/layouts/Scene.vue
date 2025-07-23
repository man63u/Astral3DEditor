<script lang="ts" setup>
import {ref} from 'vue';
import {Vector2} from "three";
import Viewport from "@/components/viewport/Viewport.vue";
import {useDrawingStore} from "@/store/modules/drawing";
import Drawing from "@/components/drawing/Drawing.vue";
import {useDragStore} from "@/store/modules/drag";
import { useGlobalConfigStore } from '@/store/modules/globalConfig';

const globalConfigStore = useGlobalConfigStore();

const viewerContainerRef = ref();
const viewportRef = ref();
const drawingRef = ref();

// 图纸组件相关
const drawingStore = useDrawingStore();

/** 鼠标拖拽事件相关 **/
const dragStore = useDragStore();

function sceneDrop(event) {
  event.preventDefault();

  // 设置鼠标释放时的区域屏幕坐标
  dragStore.endPosition = new Vector2(event.layerX,event.layerY);

  if(event.target){
    if(viewportRef.value?.$el?.contains(event.target)){
      dragStore.endArea = "Scene";
    }else if(drawingRef.value?.$el?.contains(event.target)){
      dragStore.endArea = "Drawing";
    }else{
      dragStore.endArea = "";
    }
  }

  const dt = event.dataTransfer as DataTransfer;

  //拖拽大纲视图
  if (dt.types[0] === 'text/plain') return;

  if (dt.items) {
    //支持文件夹
    window.editor.loader.loadItemList(dt.items);
  } else {
    window.editor.loader.loadFiles(dt.files, undefined, () => {
    });
  }
}

function sceneDragOver(event) {
  event.preventDefault();
  (event.dataTransfer as DataTransfer).dropEffect = 'copy';
}

function sceneDragEnter() {
  dragStore.setActionTarget("addToScene");
}

function sceneDragLeave(e) {
  // 确保移出了场景区+图纸区
  if(e.fromElement && viewerContainerRef.value.$el.contains(e.fromElement)) return;

  dragStore.setActionTarget("");
}

/** 鼠标拖拽事件相关 End **/
</script>

<template>
  <n-spin ref="viewerContainerRef" :show="globalConfigStore.loading" @drop="sceneDrop" @dragover="sceneDragOver"  @dragenter="sceneDragEnter"
          @dragleave="sceneDragLeave">
    <n-split direction="horizontal" :max="0.85" :min="0.15"
             :pane1-style="{display: drawingStore.getIsUploaded ? 'flex' : 'none'}" :resize-trigger-size="drawingStore.getIsUploaded ? 3 : 0">
      <template #1 v-if="drawingStore.getIsUploaded">
        <Drawing ref="drawingRef" />
      </template>
      <template #2>
        <Viewport ref="viewportRef" />
      </template>
    </n-split>

    <template #description>{{ globalConfigStore.loadingText }}</template>
  </n-spin>
</template>

<style lang="less" scoped>
.n-spin-container {
  width: 100%;
  height: 100%;
  overflow: hidden;

  :deep(.n-spin-content) {
    width: 100%;
    height: 100%;

    .n-split {
      &-pane-1,&-pane-2 {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
      }
    }

    .n-descriptions{
      &-header{
        margin-bottom: 0;
      }
    }
  }
}
</style>
