import { Hono } from 'hono'
import { serveStatic } from 'hono/serve-static.module'
import build from './build.json'

interface Env {
	__STATIC_CONTENT: KVNamespace
}
interface HonoEnv {
	Bindings: Env
}

function encodeBase64(array: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(array)));
}
function encodeBase64Url(array: ArrayBuffer): string {
  return encodeBase64(array)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
async function sha256(text: string): Promise<string> {
	let hash = await crypto.subtle.digest({name: "SHA-256"},new TextEncoder().encode(text));
	return encodeBase64Url(hash);
}

const app = new Hono<HonoEnv>()
const staticMiddleware = serveStatic({root: './'});
app.get('/', (c) => c.text('This domain hosts a few custom js files for my projects'))
app.get('/favicon.ico', (c) => c.text('', 404))
app.get('/version', (c) => c.json(build));
app.get('/combo', async (c) => {
	let result = [];
	let {host} = new URL(c.req.url);
	let paths = c.req.queries('p');
	let promises = [];
	if (paths) {
		let hash = (await sha256(
			build.commit +
			'\ncombo:' + paths.length + '\n' +
			paths.join('\n')
			)).slice(0, 16);
		let cachedRequest = new Request(`https://${host}/combo/${hash}`);
		let cachedResponse = await caches.default.match(cachedRequest);
		if (cachedResponse) {
			let oldResponse = cachedResponse;
			cachedResponse = new Response(cachedResponse.body, {...cachedResponse});
			for (let [k,v] of oldResponse.headers.entries()) {
				// manually copy headers? For some reason it is being dropped
				cachedResponse.headers.append(k, v);
			}
			return cachedResponse;
		}

		let type : 'js' | 'css' | null = null;
		let err = false;
		for (let path of paths) {
			if (path.endsWith('.js')) {
				if (type == null || type == 'js') {
					type = 'js';
				} else {
					err = true;
				}
			} else if (path.endsWith('.css')) {
				if (type == null || type == 'css') {
					type = 'css';
				} else {
					err = true;
				}
			} else {
				err = true;
			}
			if (err) {
				return new Response('Unsupported content type or combination', {
					status: 400
				})
			}
			let request = new Request(`https://${host}/${path}`);
			promises.push((async function() {
				const response = await app.fetch(request, c.env, c.executionCtx);
				if (response.status == 200) {
					return await response.text();
				} else {
					console.log(`${path} => ${response.status}`)
					return `// Could not load "${path.replaceAll(/[^a-zA-Z0-9\.\-\/]/g,'')}"\n`
				}
			})());
		}
		for (let promise of promises) {
			let text = await promise;
			result.push(text);
		}
		let contentType = 'text/plain';
		if (type == 'js') {
			contentType = 'application/javascript';
		} else if (type == 'css') {
			contentType = 'text/css';
		}
		let response = new Response(result.join(''), {
			headers: new Headers([
				['cache-control', 'public, max-age 604800'],
				['content-type', contentType]
			])
		});
		response.headers.set('cache-control', 'public, max-age 604800');
		response.headers.set('content-type', contentType);
		c.executionCtx.waitUntil(caches.default.put(cachedRequest, response.clone()));
		return response;
	} else {
		return new Response('// Add "p" parameters', {
			headers: new Headers([
				['content-type', 'application/javascript']
			])
		});
	}
});
app.get('/min/:paths', async (c) => {
	let pathparam = c.req.param('paths');
	let {host} = new URL(c.req.url);
	let url = new URL(`https://${host}/combo`);
	for (let path of pathparam.split(':')) {
		url.searchParams.append('p', `${path}.min.js`);
	}
	return await app.fetch(new Request(url.toString()), c.env, c.executionCtx);
});
app.use('/*', async (c, next) => {
	let {host, pathname, searchParams} = new URL(c.req.url);
	let nocache = searchParams.get('nocache');
	let resetCache = searchParams.get('reset-cache');

	let cachedRequest = new Request(`https://${host}/${build.commit}${pathname}`);
	if (resetCache != undefined) {
		await caches.default.delete(cachedRequest);
	}
	if (!nocache) {
		let cachedResponse = await caches.default.match(cachedRequest);
		if (cachedResponse) {
			return cachedResponse;
		}
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
