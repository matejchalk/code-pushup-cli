import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackageJson } from 'nx/src/utils/package-json';

const workspaceRoot = join(fileURLToPath(dirname(import.meta.url)), '../../');
const projectsFolder = join(
  fileURLToPath(dirname(import.meta.url)),
  '../../../',
);

export const cpNxPluginVersion = (await loadPackageJson(workspaceRoot)).version;
export const cpModelVersion = (
  await loadPackageJson(join(projectsFolder, 'cli'))
).version;
export const cpUtilsVersion = (
  await loadPackageJson(join(projectsFolder, 'utils'))
).version;
export const cpCliVersion = (
  await loadPackageJson(join(projectsFolder, 'models'))
).version;

async function loadPackageJson(folderPath: string): Promise<PackageJson> {
  const raw = await readFile(join(folderPath, 'package.json'));
  return JSON.parse(raw.toString()) as PackageJson;
}
