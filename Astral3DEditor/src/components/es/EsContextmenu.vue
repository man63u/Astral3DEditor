<template>
    <n-dropdown v-bind="attrs" :x="x" :y="y" :options="options" :show="visible" :on-clickoutside="onClickoutside" @select="handleSelect" />
</template>

<script setup lang="ts">
import { useAttrs,ref } from "vue";

withDefaults(defineProps<{
    options: any[];
}>(), {
    options:[] as any,
})
const emits = defineEmits(['select']);

const attrs = useAttrs();
const visible = ref(false);
const x = ref(0);
const y = ref(0);

function onClickoutside(){
    visible.value = false;
}

function handleSelect(key:string){
    emits('select',key)
    visible.value = false;
}

function show(_x,_y){
    x.value = _x;
    y.value = _y;

    visible.value = true;
}

defineExpose({
    show
})
</script>

<style scoped lang="less">

</style>

