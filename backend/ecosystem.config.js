module.exports = {
  apps: [{
    name: "justice-yemen-org",
    cwd: "/www/wwwroot/justice-yemen.org/current",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
};