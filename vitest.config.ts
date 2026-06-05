import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

export default defineConfig({
    plugins: [react(), svgr()],
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.{test,test.tsx,spec,spec.tsx}'],
        setupFiles: './src/__tests__/setupTests.ts'
    }
})
