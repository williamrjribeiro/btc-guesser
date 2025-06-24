# btc-guesser

An online game for guessing the movements of the BTC market price.

The most important aspects of any game are its entertainment, visual appeal, and interactive elements. A good balance of these elements usually makes the game engaging and successful. Understanding the player’s general context and habits also helps tweak the game experience. Considering all this, I put a good amount of effort into making the interface mobile-first and responsive, as well as making the graphics visually pleasing and engaging. I also tuned the tone of the in-game copy to match a casual cryptocurrency user with a touch of humor. I also extensively used UI emojis to convey meaning, tone, and nuance. It’s also the poor man alternative to cool images. 😅

I followed some basic Lean Development principles and XP practices. To name a few:

1. **Build quality:** I applied the general code quality principles like SOLID, DRY, and Clean Code. Tools like TypeScript, ESLint, and Prettier were also used to automate the detection and fix source code issues. Finally, I developed some tests following the BDD approach to define and validate the expected behaviors.
2. **Deffer commitment:** The code was implemented using a pattern similar to the Ports and Adapters. This allowed me to explore the interfaces and APIs early before committing to their final implementation, which is why there are so many mocks in the codebase.
3. **Behavior-driven development:** Writing the specification in plain English is the first step to comprehending what the application should do without being distracted by implementation details. Most of the Game Core has tests. In the interest of time, just the Game Core was tested.
4. **Customer involvement:** I added a user feedback link to allow users to voice their opinions and participate in the project development.
5. **Continuous integration:** A simple automated code quality check was implemented using GitHub Actions to verify that every PR adheres to minimal quality standards.

## Architecture overview

The main components are organized by folders:

- **Game-core:** Plain TypeScript code with minimal usage of external libraries. It contains the main game loop and logic. Also, define types and interfaces for external functionalities. Similar to the Ports-Adapters pattern. The rule is that the game core must not have any dependencies outside the core. All other parts of the application may depend on the core.
- **Adapters:** This class implements the Ports defined and used by the game core. It also implements persistence and external API communication. Uses the Repository pattern with DynamoDB for high score storage.
- **web-ui:** The web application for the game. It uses the game core and adapters. It is a simple single-page application using Preact and Signals. All UI components are custom-made using CSS and HTML, following the classic BEM approach.

## Development setup

You'll need to use:

- NodeJS v22
- PNPM v10
- AWS-CLI for deployment

If you use Homebrew on macOS, you can install everything with the command:

```bash
brew bundle --file required.Brewfile
```

## Deployment

The application is deployed to my AWS Fire Emblem personal account. Only invited members with the right permissions can deploy it.

To start a local session for deployment:

```bash
pnpm run aws:sso
```

`[sso-session fire-emblem]` must be already configured in your local `~/.aws/config`.
