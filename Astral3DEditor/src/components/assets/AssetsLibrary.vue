<template>
    <n-tabs v-model:value="currentNav" type='line' size="small" justify-content="space-around" class="h-full"
        pane-class="h-full overflow-y-auto">
        <n-tab-pane v-for="panel in nav" :key="panel.key" :name="panel.key" display-directive="show">
            <template #tab>
                <n-tooltip trigger="hover" placement="bottom">
                    <template #trigger>
                        <n-icon size="18" class="px-1">
                            <component :is="panel.icon"></component>
                        </n-icon>
                    </template>
                    {{ panel.name }}
                </n-tooltip>
            </template>
            <component :is="panel.component"></component>
        </n-tab-pane>
    </n-tabs>
</template>

<script lang="ts" setup>
import { ref, markRaw } from "vue";
import { CubeOutline, SunnyOutline, VideocamOutline } from "@vicons/ionicons5";
import { LocationHeart } from "@vicons/carbon";
import { Delicious } from "@vicons/fa";
import { cpt } from "@/language";
import Object3d from "./assetsLibrary/Object3d.vue";
import Lights from "./assetsLibrary/Lights.vue";
import Cameras from "./assetsLibrary/Cameras.vue";
import Material from "./assetsLibrary/Material.vue";
import HtmlPlane from "./assetsLibrary/HtmlPlane.vue";

const currentNav = ref("object3d");
const nav = ref([
    { key: "object3d", name: cpt("layout.header.Object3D"), icon: markRaw(CubeOutline), component: markRaw(Object3d) },
    { key: "light", name: cpt("layout.header.Light"), icon: markRaw(SunnyOutline), component: markRaw(Lights) },
    { key: "camera", name: cpt("layout.header.Camera"), icon: markRaw(VideocamOutline), component: markRaw(Cameras) },
    { key: "material", name: cpt("layout.sider.Material"), icon: markRaw(Delicious), component: markRaw(Material) },
    { key: "htmlPlane", name: cpt("layout.sider.Html plane"), icon: LocationHeart, component: markRaw(HtmlPlane) }
])
</script>

<style scoped></style>
