import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'datasheet-proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/api/datasheet-download', async (req, res) => {
          try {
            const urlObj = new URL(req.url || '', 'http://localhost');
            const targetUrl = urlObj.searchParams.get('url');
            const name = urlObj.searchParams.get('name') || 'datasheet.pdf';

            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url parameter');
              return;
            }

            const fetchRes = await fetch(decodeURIComponent(targetUrl));
            if (!fetchRes.ok) {
              res.statusCode = fetchRes.status;
              res.end('Failed to fetch remote datasheet');
              return;
            }

            res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${name.replace(/[^a-zA-Z0-9_.-]/g, '_')}"`);
            res.setHeader('Access-Control-Allow-Origin', '*');

            const buffer = await fetchRes.arrayBuffer();
            res.end(Buffer.from(buffer));
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
        });
      },
    },
  ],
})
