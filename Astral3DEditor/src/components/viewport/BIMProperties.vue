<template>
    <n-card v-if="visible" class="absolute top-40px right-1 max-w-300px" content-style="padding: 5px 10px;">
        <n-collapse accordion default-expanded-names="bim">
            <template #arrow="{ collapsed }">
                <n-icon v-if="collapsed">
                    <PlanetOutline />
                </n-icon>
                <n-icon v-else>
                    <SunnyOutline />
                </n-icon>
            </template>

            <n-collapse-item title="&nbsp;BIM 构件信息" name="bim">
                <div class="max-h-360px overflow-y-auto">
                    <n-descriptions v-for="(item, index) in info.parameters" :key="index" label-placement="left"
                        bordered size="small" :column="1">
                        <template #header>
                            <p class="py-2">{{ item.GroupName }}</p>
                        </template>
                        <n-descriptions-item v-for="(it, i) in item.Parameters" :key="i + it.name" :label="it.name">
                            {{ it.value }}
                        </n-descriptions-item>
                    </n-descriptions>
                </div>
            </n-collapse-item>
        </n-collapse>
    </n-card>
</template>

<script setup lang="ts">
import { PlanetOutline, SunnyOutline } from "@vicons/ionicons5";
import { ref, onBeforeUnmount, onMounted } from "vue";
import { useAddSignal, useRemoveSignal } from "@/hooks/useSignal";

const visible = ref(false);
const info = ref({
    parameters: [{ GroupName: "", Parameters: [{ name: "", value: "" }] }]
})

function objectSelected(object) {
    if (!object) {
        visible.value = false;
        return;
    }
    if (!object.userData.BIM) {
        if (!object.parent || !object.parent.userData.BIM) {
            visible.value = false;
        } else {
            visible.value = true;
            info.value = object.parent.userData.BIM;
        }
    } else {
        visible.value = true;
        info.value = object.userData.BIM;
    }
}

onMounted(() => {
    useAddSignal("objectSelected", objectSelected);
})

onBeforeUnmount(() => {
    useRemoveSignal("objectSelected", objectSelected);
})
</script>