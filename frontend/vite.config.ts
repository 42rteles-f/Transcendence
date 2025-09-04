import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    server: {
        port: 5173,
        host: '0.0.0.0',
        https: {
            key: fs.readFileSync(path.resolve(__dirname, 'certs/server.key')),
            cert: fs.readFileSync(path.resolve(__dirname, 'certs/server.crt'))
        },
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'unsafe-none',
        }
    },
});
