module.exports = {
  apps: [
    {
      name: "MedEire_backend",
      script: "npm run start",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
