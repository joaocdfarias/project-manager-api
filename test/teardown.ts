import { execSync } from 'child_process';

module.exports = () => {
  console.log('\nStopping test container...\n');
  execSync(
    'docker compose -p project-manager-api-int -f docker-compose.test.yaml --env-file .env.test down -v --remove-orphans',
    { cwd: process.cwd(), stdio: 'inherit' },
  );
};
