import {
    defineConfig,
    presetAttributify,
    presetWind3
} from 'unocss'

export default defineConfig({
    presets: [
        presetWind3(),
        presetAttributify(),            // 支持属性化写法 <div m-4 p-2 />

        // ...
    ],
})