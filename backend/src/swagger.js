import swaggerJsdoc from 'swagger-jsdoc';
import listEndpoints from 'express-list-endpoints';

function extractRoutes(router, base = '') {
  const routes = [];
  for (const layer of router.stack || []) {
    if (layer.route) {
      const routePath =
        layer.route.path === '/' ? base : `${base}${layer.route.path}`;
      const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
      routes.push({ path: routePath, methods });
    }
  }
  return routes;
}

export default function generateSwaggerSpec(app, mappings = []) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Travonex API',
        version: '1.0.0'
      }
    },
    // Resolve absolute path so docs work regardless of CWD
    apis: [new URL('./routes/*.js', import.meta.url).pathname]
  };

  const spec = swaggerJsdoc(options);
  spec.paths = spec.paths || {};
  const configs = mappings.length ? mappings : app ? [['', app]] : [];

  configs.forEach(([base, router]) => {
    for (const { path, methods } of extractRoutes(router, base)) {
      if (!path.startsWith('/api')) continue;
      const openapiPath = path.replace(/:([^/]+)/g, '{$1}');
      spec.paths[openapiPath] = spec.paths[openapiPath] || {};
      for (const method of methods) {
        const lower = method.toLowerCase();
        if (!spec.paths[openapiPath][lower]) {
          spec.paths[openapiPath][lower] = {
            summary: `${method} ${path}`,
            responses: {
              200: { description: 'Success' }
            }
          };
        }
      }
    }
  });
  if (app) {
    spec.paths = spec.paths || {};
    const configs = mappings.length
      ? mappings
      : [['', app]];
    configs.forEach(([base, router]) => {
      const endpoints = listEndpoints(router);
      endpoints.forEach(({ path, methods }) => {
        const fullPath = `${base}${path}`;
        if (!fullPath.startsWith('/api')) return;
        const openapiPath = fullPath.replace(/:([^/]+)/g, '{$1}');
        if (!spec.paths[openapiPath]) {
          spec.paths[openapiPath] = {};
        }
        methods.forEach(method => {
          const lower = method.toLowerCase();
          if (!spec.paths[openapiPath][lower]) {
            spec.paths[openapiPath][lower] = {
              summary: `${method} ${fullPath}`,
              responses: {
                200: { description: 'Success' }
              }
            };
          }
        });
      });
    });
  }

  // Merge duplicate paths that may include trailing slashes
  const deduped = {};
  for (const [path, ops] of Object.entries(spec.paths)) {
    const key = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
    deduped[key] = { ...(deduped[key] || {}), ...ops };
  }
  spec.paths = deduped;

  return spec;
}
