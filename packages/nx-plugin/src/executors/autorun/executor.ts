import { AutorunExecutorSchema } from './schema';

export default async function runExecutor(options: AutorunExecutorSchema) {
  console.log('Executor ran for Autorun', options);
  return {
    success: true,
  };
}
