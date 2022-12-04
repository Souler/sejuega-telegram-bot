# sejuega-telegram-bot
> 🚧 This is a Work In Progress project! Things might (and will) break and change on a commit-basis!

## Running locally

- Get your Telegram Bot API token via [BotFather](https://telegram.me/BotFather)
- Clone the repo
- Create an `.env` file and place your telegram bot token as: `TELEGRAM_BOT_TOKEN=<your token here>`
- Run `npm start`
- Interact with your bot on Telegram and you should start seeing some logs

> ⚠️ Persistence layer used is stored **in a `.store.json` file** at the root of the project

> ⚠️ The bot runs in polling mode (as opposed to webhook). This means behavior might differ a bit from production; where webhook mode is used.
