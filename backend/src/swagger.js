import swaggerJsdoc from 'swagger-jsdoc';

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
    apis: ['src/routes/*.js']
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

  return spec;
}
