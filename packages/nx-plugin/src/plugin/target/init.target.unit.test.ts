import { expect } from 'vitest';
import { createInitTarget } from './init-target';

describe('createInitTarget', () => {
  it('should create code-pushup--init target when called', () => {
    const projectName = 'plugin-my-plugin';
    expect(createInitTarget(projectName)).toStrictEqual({
      command: `nx g nx-plugin:init --project=${projectName}`,
    });
  });
});
