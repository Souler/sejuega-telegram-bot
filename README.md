# sejuega-telegram-bot
> 🚧 This is a Work In Progress project! Things might (and will) break and change on a commit-basis!

## Running locally

- Clone the repo
- Create an `.env` file and place your telegram bot token as: `TELEGRAM_BOT_TOKEN=xxxxxxxx`
- Run `npm start`

**Considerations**
- Persistence layer used is stored **in-memory** meaning everytime you run `npm start` it starts with an empty state
- The bot runs in polling mode (as opposed to webhook). This means behavior might differ a bit from production; where webhook mode is used.