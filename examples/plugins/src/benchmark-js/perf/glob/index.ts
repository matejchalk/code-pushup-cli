import { join } from 'node:path';
import yargs from 'yargs';
import { glob } from './glob';
import { globby } from './globby';

const fg = await import('fast-glob').then(({ default: m }) => m);
export function fastGlob(pattern: string[]): Promise<string[]> {
  return fg.async(pattern);
}

const cli = yargs(process.argv).options({
  pattern: {
    type: 'array',
    default: [join(process.cwd(), 'node_modules', '**/*.js')],
  },
  verbose: {
    type: 'boolean',
    default: false,
  },
  outputDir: {
    type: 'string',
  },
});

const { pattern, outputDir } = cli.parseSync();

console.log('You can adjust the test with the following arguments:');
console.log(
  `pattern      glob pattern of test      --pattern=${pattern.toString()}`,
);

// ==================

export default {
  outputDir,
  suitName: 'glob',
  cases: [
    ['current-implementation', wrapWithDefer(fastGlob)],
    ['glob', wrapWithDefer(glob)],
    ['globby', wrapWithDefer(globby)],
  ],
};

// ==============================================================

function wrapWithDefer(asyncFn: (pattern: string[]) => Promise<string[]>) {
  const logged: Record<string, boolean> = {};
  return {
    defer: true, // important for async functions
    fn: function (deferred: { resolve: () => void }) {
      return asyncFn([pattern.toString()])
        .catch(() => [])
        .then((result: unknown[]) => {
          if (result.length === 0) {
            throw new Error(`Result length is ${result.length}`);
          } else {
            if (!logged[asyncFn.name]) {
              // eslint-disable-next-line functional/immutable-data
              logged[asyncFn.name] = true;
              // eslint-disable-next-line no-console
              console.log(`${asyncFn.name} found ${result.length} files`);
            }
            deferred.resolve();
          }
          return void 0;
        });
    },
  };
}