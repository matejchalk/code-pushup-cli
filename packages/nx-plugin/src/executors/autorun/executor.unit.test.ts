import { expect } from 'vitest';
import executor from './executor';
import { AutorunExecutorSchema } from './schema';

const options: AutorunExecutorSchema = {};

describe('Autorun Executor', () => {
  it('can run', () => {
    const output = executor(options);
    expect(output.success).toBe(true);
  });
});
