import { Hono } from 'hono'
import { serveStatic } from 'hono/serve-static.module'

interface Env {
	__STATIC_CONTENT: KVNamespace
}
interface HonoEnv {
	Bindings: Env
}

const app = new Hono<HonoEnv>()
const staticMiddleware = serveStatic({root: './'});
app.get('/', (c) => c.text('This domain hosts a few custom js files for my projects'))
app.use('/*', async (c, next) => {
	let {host, pathname} = new URL(c.req.url);
	let cachedRequest = new Request(`https://${host}${pathname}`);
	let cachedResponse = await caches.default.match(cachedRequest);
	if (cachedResponse) {
		return cachedResponse;
	}
	const response = await staticMiddleware(c, next);
	if (response) {
		if (response && response.status == 200) {
			response.headers.append('cache-control', 'max-age=604800');
		}
		c.executionCtx.waitUntil(caches.default.put(cachedRequest, response.clone()));
		return response;
	} else {
		return c.text('Not Found', 404);
	}
})

export default app;
