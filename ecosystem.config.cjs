module.exports = {
  apps: [
    {
      name: "MTSoftServer",
      port: "3001",
      exec_mode: "fork",
      instances: "1",
      script: "./dist/server.js",
      env: {
        MONGODB_URI: process.env.MONGODB_URI,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        NODEMAILER_PASS_ANDRIUS: process.env.NODEMAILER_PASS_ANDRIUS,
        NODEMAILER_PASS_AUDRIUS: process.env.NODEMAILER_PASS_AUDRIUS,
        NODEMAILER_PASS_HARIS: process.env.NODEMAILER_PASS_HARIS,
        SALT: process.env.SALT,
        TOKEN_SECRET: process.env.TOKEN_SECRET,
        NODE_ENV: "production",
      },
    },
  ],
};
