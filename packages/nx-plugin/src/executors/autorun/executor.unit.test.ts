import { expect } from 'vitest';
import executor from './executor';
import { AutorunExecutorSchema } from './schema';

const options: AutorunExecutorSchema = {};

describe('Autorun Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
