module.exports = {
  apps: [
    {
      name: "MTSoftServer",
      port: "3001",
      exec_mode: "fork",
      instances: "1",
      script: "./dist/server.js",
    },
  ],
};
