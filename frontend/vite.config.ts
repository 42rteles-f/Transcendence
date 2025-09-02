import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
	plugins: [
		tailwindcss(),
	],
	server: {
		port: 5173,
		host: '0.0.0.0',
		headers:																// Useless
		{
			'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
			'Cross-Origin-Embedder-Policy': 'unsafe-none',
		}
	},
})
