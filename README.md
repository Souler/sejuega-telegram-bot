# sejuega-telegram-bot
> 🚧 This is a Work In Progress project! Things might (and will) break and change on a commit-basis!

## Running locally

### Prerequisites

- A Telegram Bot and its API token. You can create one via [BotFather](https://telegram.me/BotFather)
- A firebase project with:
  - Realtime Database enabled and its database URL (e.g: `https://my-app.europe-west1.firebasedatabase.app`)
  - A Service Account key file (usually a `.json` file). You can create it on your project's firebase console under the project settings. 

### Running locally
- Clone the repo
- Create an `.env` on the root of the repo with the following:
  - Your Telegram bot's token as `TELEGRAM_BOT_TOKEN=xxxxxxxx`
  - Your Firebase project Realtime Database's URL as `FIREBASE_DATABASE_URL=https://my-app.europe-west1.firebasedatabase.app`
  - The **absolute path** to the Service Account key file as `GOOGLE_APPLICATION_CREDENTIALS=/users/me/downloads/service-account-key.json`
- Run `npm start`

> ⚠️ The bot runs in polling mode (as opposed to webhook). This means behavior might differ a bit from production; where webhook mode is used.
