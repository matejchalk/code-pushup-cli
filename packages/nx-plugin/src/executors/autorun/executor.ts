import { AutorunExecutorSchema } from './schema';

export default function runExecutor(options: AutorunExecutorSchema) {
  console.info('Executor ran for Autorun', options);
  return {
    success: true,
  };
}
