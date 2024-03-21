// import { fileURLToPath, URL } from 'node:url'

// import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import WindiCSS from 'vite-plugin-windicss'

// https://vitejs.dev/config/
// path模块提供了一些工具函数，用于处理文件与目录的路径
import { resolve } from 'path'
// 使用 defineConfig 工具函数，这样不用 jsdoc 注解也可以获取类型提示
import { defineConfig } from 'vite'

/** 当前执行 node 命令时文件夹的地址（工作目录） */
const root: string = process.cwd()

/** 路径拼接函数，简化代码 */
const pathResolve = (dir: string): string => resolve(root, dir)

export default defineConfig({
	plugins: [vue(), VueDevTools(), WindiCSS()],
	resolve: {
		alias: [
			// 设置 `@` 指向 `src` 目录
			{ find: '@', replacement: pathResolve('src') },
			// 设置 `@assets` 指向 `src/assets` 目录
			{ find: '@assets', replacement: pathResolve('src/assets') },
			// 设置 `@components` 指向 `src/components` 目录
			{ find: '@components', replacement: pathResolve('src/components') },
			// 设置 `@views` 指向 `src/views` 目录
			{ find: '@views', replacement: pathResolve('src/views') },
			// 设置 `@utils` 指向 `src/utils` 目录
			{ find: '@utils', replacement: pathResolve('src/utils') }
			// 可以根据需要添加更多的别名
		]
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@import "@/assets/style/main.scss";'
			}
		}
	},
	build: {
		// ...其他配置
		rollupOptions: {
			output: {
				manualChunks(id) {
					// 将pinia的全局库实例打包进vendor，避免和页面一起打包造成资源重复引入
					if (id.includes(path.resolve(__dirname, 'src/store/index.ts'))) {
						return 'vendor'
					}
				}
			}
		}
	}
})
