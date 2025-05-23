// /var/www/html/dollarsandlife/ecosystem.config.js
module.exports = {
    apps: [{
        name: "dollarsandlife",
        script: "./server.js", // <--- Ensure it's this
        cwd: "/var/www/html/dollarsandlife/",
        watch: false,
        env_production: {
            "NODE_ENV": "production",
            "PORT": 5000,
        }
    }]
}