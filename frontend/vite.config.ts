import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
	plugins: [
		tailwindcss(),
		basicSsl(),
	],
	server: {
		port: 5173,
		host: '0.0.0.0',
		headers:
		{
			'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
			'Cross-Origin-Embedder-Policy': 'unsafe-none',
		}
	},
})
