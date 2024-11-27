# 🎉 Good First Issue Pulse - Discord Bot 🎉

[![GitHub issues](https://img.shields.io/github/issues/VictorDoyle/GFIPulse)](https://github.com/VictorDoyle/GFIPulse/issues)
[![GitHub license](https://img.shields.io/github/license/VictorDoyle/GFIPulse)](https://github.com/VictorDoyle/GFIPulse)
![GitHub Actions](https://github.com/VictorDoyle/GFIPulse/actions/workflows/cronjob.yml/badge.svg)

---

## 🚀 Overview

**Good First Issue Pulse** (GFIP) is a Discord bot designed to help developers find and contribute to open-source projects. It automatically alerts you about open issues that need help fixing by sending messages directly to your Discord channel. Whether you're a beginner looking to start your open-source journey or an experienced developer wanting to give back, this bot makes it easy to find good first issues and stay active.

---

## 📸 Demo

Screenshot of the GFIP bot sending an automated discord message to a designated channel.
![Demo](https://github.com/user-attachments/assets/1f189cce-1187-445c-a627-0e4002dfa5f8)

---

## ⚙️ Features

- **Automated-timed Alerts**: Get notifications for new open issues that need attention every 24 hours.
- **Customizable**: Configure the bot to monitor specific repositories and labels, specific languages and more.
- **User-Friendly**: Simple setup and easy-to-use commands.
- **Community-Driven**: Contribute to your favorite open-source projects and help others do the same!
- **Data-Optimized**: We used Redis to store and shift which Github issues you've already looked at.

---

## Setting up

- Make sure you have access to CLI Redis, if you don't run `brew install redis`
- You can check if you have CLI Redis by writing `redis-cli ping` you should get `PONG` back as a response in CLI
- You'll need to setup a DB via `https://cloud.redis.io/#/`.
- Hold onto the following values and set them up in your github secrets or a local .env file:
  - REDIS_HOST
  - REDIS_PORT
  - REDIS_PASSWORD
- Once all three are in your .env or Github Secrets, you should be able to run `npm run start` and it should populate your redis DB with a list of IDs linked to GitHub Issues

## Debugging

- Setup local access to Redis via CLI and run `SMEMBERS fetched_issues` to make sure you're seeing a list of fetched issues
- You can run `SCARD fetched_issues` to view the size of the set of fetched issues
