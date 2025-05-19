/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "btc-guesser",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile: "crypto-guesser",
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const web = new sst.aws.StaticSite("WebUI", {
      build: {
        output: "dist",
        command: "pnpm run build",
      },
    });

    return { web: web.url };
  },
});
