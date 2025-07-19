import swaggerJsdoc from 'swagger-jsdoc';

// Walk router stacks to list endpoints
export function extractEndpoints(routeMappings) {
  const routes = [];

  const collect = (router, prefix) => {
    router.stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
        const suffix = layer.route.path === '/' ? '' : layer.route.path;
        routes.push({ path: `${prefix}${suffix}`, methods });
      } else if (layer.name === 'router' && layer.handle?.stack) {
        collect(layer.handle, prefix);
      }
    });
  };

  for (const [base, router] of routeMappings) {
    collect(router, base);
  }

  return routes;
}

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

export default function generateSwaggerSpec(routeMappings) {
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

  const endpoints = extractEndpoints(routeMappings);
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
      if (['post', 'put', 'patch'].includes(lower)) {
        spec.paths[openapiPath][lower].requestBody =
          spec.paths[openapiPath][lower].requestBody || {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
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
