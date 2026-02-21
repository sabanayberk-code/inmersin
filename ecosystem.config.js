module.exports = {
    apps: [
        {
            name: "inmersin-app",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                DATABASE_URL: "file:./prod.db",
                PORT: 3000
            },
        },
    ],
};
