import type { CreateNodes, CreateNodesContext } from '@nx/devkit';
import type { CreateNodesResult } from 'nx/src/utils/nx-plugin';
import { CreateNodesOptions } from './model';
import { createTargets } from './target/targets';
import { normalizedCreateNodesContext } from './utils';

// name has to be "createNodes" to get picked up by nx
export const createNodes: CreateNodes = [
  '**/project.json',
  async (
    projectConfigurationFile: string,
    createNodesOptions: unknown,
    context: CreateNodesContext,
  ): Promise<CreateNodesResult> => {
    const parsedCreateNodesOptions = createNodesOptions as CreateNodesOptions;
    const normalizedContext = await normalizedCreateNodesContext(
      context,
      projectConfigurationFile,
      parsedCreateNodesOptions,
    );

    return {
      projects: {
        [normalizedContext.projectRoot]: {
          targets: await createTargets(normalizedContext),
        },
      },
    };
  },
];
