import swaggerJsdoc from 'swagger-jsdoc';
import listEndpoints from 'express-list-endpoints';

// Common status code responses for documentation
const DEFAULT_RESPONSES = {
  GET: {
    200: { description: 'OK' },
    400: { description: 'Bad Request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
    500: { description: 'Server Error' }
  },
  POST: {
    201: { description: 'Created' },
    400: { description: 'Bad Request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
    500: { description: 'Server Error' }
  },
  PUT: {
    200: { description: 'OK' },
    400: { description: 'Bad Request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
    500: { description: 'Server Error' }
  },
  PATCH: {
    200: { description: 'OK' },
    400: { description: 'Bad Request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
    500: { description: 'Server Error' }
  },
  DELETE: {
    200: { description: 'OK' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
    500: { description: 'Server Error' }
  }
};

export default function generateSwaggerSpec(app) {
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

  const endpoints = listEndpoints(app);
  endpoints.forEach(({ path, methods }) => {
    if (!path.startsWith('/api')) return;
    const openapiPath = path.replace(/:([^/]+)/g, '{$1}');
    spec.paths[openapiPath] = spec.paths[openapiPath] || {};

    methods.forEach((method) => {
      const lower = method.toLowerCase();
      if (!spec.paths[openapiPath][lower]) {
        spec.paths[openapiPath][lower] = {
          summary: `${method} ${path}`,
          responses: { ...DEFAULT_RESPONSES[method] }
        };
      } else {
        spec.paths[openapiPath][lower].responses = {
          ...DEFAULT_RESPONSES[method],
          ...(spec.paths[openapiPath][lower].responses || {})
        };
      }
    });
  });

  // Merge duplicate paths that may include trailing slashes
  const deduped = {};
  for (const [path, ops] of Object.entries(spec.paths)) {
    const key = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
    deduped[key] = { ...(deduped[key] || {}), ...ops };
  }
  spec.paths = deduped;

  return spec;
}
