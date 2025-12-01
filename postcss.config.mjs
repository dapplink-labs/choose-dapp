const config = {
    plugins: {
        '@unocss/postcss': {
            content: ['./app/**/*.{html,js,ts,jsx,tsx}'],
        },
        'postcss-px-to-viewport': {
            viewportWidth: 1920,          // 设计稿宽度（常见移动端）
            // viewportHeight: 667,      // 可选
            unitPrecision: 5,            // 转换后的小数位精度
            viewportUnit: 'rem',          // 转换成的单位（vw、vh、rem 可选）
            selectorBlackList: ['.ignore', '.hairlines'], // 不转换的选择器
            minPixelValue: 1,            // 小于1px不转换
            mediaQuery: true,            // 允许在媒体查询中转换 px
            replace: true,
            // exclude: [/node_modules/], // 如果想排除某些第三方库可以打开
            // landscapeWidth: 568,      // 横屏时使用的视口宽度（可选）
        },
    }
}
export default config;
