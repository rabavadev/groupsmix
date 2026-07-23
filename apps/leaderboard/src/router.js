import { Hono } from "hono";
import { ROUTES } from "./routes.js";
import { shouldRequireCsrf, verifyCsrf } from "./middleware/index.js";
import { bad, handleAccountDelete } from "./auth.js";
import { withPublicApiCors } from "./middleware/public-api.js";

const apiApp = new Hono();

apiApp.use('*', async (c, next) => {
  const { request } = c.env.workerContext;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method === "HEAD" ? "GET" : request.method;

  if (shouldRequireCsrf(method, path)) {
    if (!verifyCsrf(request)) {
      return bad("CSRF validation failed. Please refresh the page.", 403);
    }
  }

  await next();
  
  if (c.res && c.res.status !== 404) {
    c.res = withPublicApiCors(c.res, path);
  }
});

for (const route of ROUTES) {
  const method = route.method.toLowerCase();
  
  apiApp[method](route.path, async (c) => {
    const { request, env, ctx, meta } = c.env.workerContext;
    const slug = c.req.param("slug") || c.req.param("id");
    const routeCtx = { slug, waitUntil: (p) => ctx.waitUntil(p) };
    return await route.handler(request, env, routeCtx, meta);
  });
}

apiApp.post("/api/account/delete", async (c) => {
  const { request, env } = c.env.workerContext;
  return await handleAccountDelete(request, env);
});

export default apiApp;
