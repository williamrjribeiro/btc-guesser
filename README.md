# btc-guesser

An online game for guessing the movements of the BTC market price

## Architecture

The main components are organized by folders:

- **game-core:** Plain TypeScript code. Contains main game loop and logic. Also define types for external functionalities. Similar to Ports-Adapters pattern.
- **adapters:** Implements the Ports define and used by the `game-core`. It implements persistence and external API communication.
- **web-ui:** Web application for the game. Uses the `game-core` and `adapters`. Probably done in Preact.

## Development setup

You'll need to use:

- NodeJS v22
- PNPM v10
- AWS-CLI for deployment

If you use Homebrew on macOs, you can install everything with the command:

```bash
brew bundle --file required.Brewfile
```

## Deployment

The application is deployed to **AWS Fire Emblem** account. Only invited members with the right permissions can deploy the application.

To start a local session for deployment:

```bash
pnpm run aws:sso
```

`[sso-session fire-emblem]` must be already configured in your local `~/.aws/config`.
