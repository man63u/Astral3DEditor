<script lang="ts" setup>
import {computed, onMounted} from 'vue';
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import {GlobalThemeOverrides} from "naive-ui";
import {Editor} from '@/core/Editor';
import {useGlobalConfigStore} from "@/store/modules/globalConfig";
import Index from "@/views/index.vue";

//实例化编辑器
const editor = new Editor();
window.editor = editor; // 将编辑器暴露到控制台
window.VRButton = VRButton;

// 全局配置相关
const globalConfigStore = useGlobalConfigStore();

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const mainColor = globalConfigStore.mainColor as IConfig.Color;

  return {
    common: {
      primaryColor: mainColor.hex,
      primaryColorHover: mainColor.hexHover,
      primaryColorPressed: mainColor.hexPressed,
      primaryColorSuppl: mainColor.hexSuppl,
      successColor: mainColor.hex,
      successColorHover: mainColor.hexHover,
      successColorPressed: mainColor.hexPressed,
      successColorSuppl: mainColor.hexSuppl,
      fontWeightStrong: '600'
    }
  }
})
</script>

<template>
  <!-- 调整 naive-ui 的字重配置 -->
  <n-config-provider :theme="globalConfigStore.getProviderTheme()" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-modal-provider>
          <n-notification-provider placement="bottom">
            <n-message-provider>
              <Index/>
            </n-message-provider>
          </n-notification-provider>
        </n-modal-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style scoped>
.n-config-provider {
  width: 100%;
  height: 100%;
}
</style>
