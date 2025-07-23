import { defineConfig, presetAttributify, presetUno, presetIcons } from 'unocss'

export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify(),
        presetIcons()
    ],
    rules: [
        ['no-wrap', { 'white-space': 'nowrap' }],
        [/^h-calc-\[?(.*?)\]?$/, ([, size]) => ({ height: `calc(100% - ${size})` })],
        [/^max-h-calc-\[?(.*?)\]?$/, ([, size]) => ({ 'max-height': `calc(100% - ${size})` })],
        [/^w-calc-\[?(.*?)\]?$/, ([, size]) => ({ width: `calc(100% - ${size})` })],
    ],
    shortcuts: [
        {
            'flex-center': 'flex items-center justify-center',
        },
    ]
})