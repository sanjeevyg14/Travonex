import swaggerJsdoc from 'swagger-jsdoc';
import listEndpoints from 'express-list-endpoints';

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

  return spec;
}
