import swaggerJsdoc from 'swagger-jsdoc';
import listEndpoints from 'express-list-endpoints';

export default function generateSwaggerSpec(app) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Travonex API',
        version: '1.0.0'
      }
    },
    apis: ['./routes/*.js']
  };

  const spec = swaggerJsdoc(options);
  if (app) {
    const endpoints = listEndpoints(app);
    spec.paths = spec.paths || {};
    endpoints.forEach(({ path, methods }) => {
      if (!path.startsWith('/api')) return;
      const openapiPath = path.replace(/:([^/]+)/g, '{$1}');
      if (!spec.paths[openapiPath]) {
        spec.paths[openapiPath] = {};
      }
      methods.forEach(method => {
        const lower = method.toLowerCase();
        if (!spec.paths[openapiPath][lower]) {
          spec.paths[openapiPath][lower] = {
            summary: `${method} ${path}`,
            responses: {
              200: { description: 'Success' }
            }
          };
        }
      });
    });
  }

  return spec;
}
