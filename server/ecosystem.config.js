// PM2 config for the Express API deployed by frontend/deploy.ps1.
// The API files are uploaded into /var/www/html/dollarsandlife/server
// and Apache proxies /api -> localhost:5001.
module.exports = {
    apps: [{
        name: "dollarsandlife-api",
        script: "./server.js",
        cwd: "/var/www/html/dollarsandlife/server",
        watch: false,
        env_production: {
            NODE_ENV: "production",
            PORT: 5001,
        }
    }]
};
