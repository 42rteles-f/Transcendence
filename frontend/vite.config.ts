import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    server: {
        port: 5173,
        host: '0.0.0.0',
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'unsafe-none',
        },
		proxy: {
            '^(?!.*\\.(css|js|html|ico|png|jpg|gif|svg|woff2|woff|ttf|eot)$)': {
                target: 'http://backend:3000',
                changeOrigin: true,
                ws: true,
                secure: false,
            }
        },
    },
});
