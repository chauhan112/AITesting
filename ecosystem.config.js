module.exports = {
  apps: [
    {
      name: 'ai-slops',
      cwd: __dirname,
      script: '/home/raja/timeline/2026/q1/Rlib/.venv/bin/python',
      args: '-m http.server 8002',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '50M',
      env: {
        DJANGO_SETTINGS_MODULE: 'config.settings',
      },
    },
  ],
};
