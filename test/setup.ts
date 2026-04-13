import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

module.exports = () => {
  console.log('\nStarting test container...\n');

  execSync(
    'docker compose -p project-manager-api-int -f docker-compose.test.yaml --env-file .env.test up -d',
    { cwd: process.cwd(), stdio: 'inherit' },
  );

  execSync(
    'docker compose -p project-manager-api-int -f docker-compose.test.yaml exec -T db sh -c "until pg_isready -U postgres; do sleep 1; done"',
    { cwd: process.cwd(), stdio: 'inherit' },
  );

  const env = dotenv.config({ path: '.env.test' }).parsed ?? {};

  execSync(
    'node -r ts-node/register -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d src/infrastructure/database/data-source.ts migration:run',
    {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env, ...env },
    },
  );
};
