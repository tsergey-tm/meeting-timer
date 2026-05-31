import {defineConfig} from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.{test,test.tsx,spec,spec.tsx}'],
        setupFiles: [path.resolve(__dirname, './src/setupTests.ts')],
    }
})