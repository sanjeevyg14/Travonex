import { routeMappings } from '../src/app.js';
import generateSwaggerSpec from '../src/swagger.js';
import assert from 'assert';

describe('Swagger documentation', () => {
  it('lists all registered endpoints', async () => {
    const spec = generateSwaggerSpec(routeMappings);
    const paths = Object.keys(spec.paths);
    for (const [base] of routeMappings) {
      const cleaned = base.replace(/\/$/, '');
      const has = paths.some(p => p.startsWith(cleaned));
      assert.ok(has, `Missing docs for ${base}`);
    }
  });
});
