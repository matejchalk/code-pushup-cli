import { CreateNodes, CreateNodesContext } from '@nx/devkit';

export type TestingCreateNodesContext = CreateNodesContext & {
  configFiles: string[];
};
export function getTestContext() {
  return {
    nxJsonConfiguration: {},
    workspaceRoot: '',
    configFiles: [],
  } satisfies TestingCreateNodesContext;
}
export async function invokeCreateNodesOnMatchingFiles(
  createNodes: CreateNodes,
  context: TestingCreateNodesContext,
  options?: unknown,
) {
  const results = await Promise.all(
    context.configFiles.map(file => createNodes[1](file, options, context)),
  );
  const aggregateProjects = results.reduce(
    (acc, { projects }) => ({ ...acc, ...projects }),
    {},
  );

  return {
    projects: aggregateProjects,
  };
}
