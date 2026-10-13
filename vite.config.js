import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], server: { port: 5173, proxy: { '/api': { target: process.env.SAST_API_PROXY || 'https://overbuilt-reshuffle-saloon.ngrok-free.dev', changeOrigin: true, secure: true }, '/health': { target: process.env.SAST_API_PROXY || 'https://overbuilt-reshuffle-saloon.ngrok-free.dev', changeOrigin: true } } } });
