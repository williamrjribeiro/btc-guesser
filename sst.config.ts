/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'btc-guesser',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          profile: 'crypto-guesser',
          region: 'us-east-1',
        },
      },
    };
  },
  async run() {
    const highScoreTable = new sst.aws.Dynamo('HighScore', {
      fields: {
        id: 'string',
        cryptoSymbol: 'string', // Partition key for GSI - allows for different crypto symbols
        scoreKey: 'string', // Sort key for GSI - SCORE#<padded-score>#DATE#<iso-date>
      },
      primaryIndex: {
        hashKey: 'id',
      },
      globalIndexes: {
        ScoreIndex: {
          hashKey: 'cryptoSymbol',
          rangeKey: 'scoreKey',
          projection: 'all',
        },
      },
    });

    const api = new sst.aws.ApiGatewayV2('Api', {
      link: [highScoreTable],
    });

    api.route('GET /api/highscore', 'src/adapters/rest/handler.getHighscore');
    api.route('POST /api/highscore', 'src/adapters/rest/handler.postHighscore');

    const web = new sst.aws.StaticSite('WebUI', {
      build: {
        output: 'src/web-ui/dist',
        command: 'pnpm run build',
      },
      environment: {
        VITE_API_URL: api.url,
      },
    });

    return {
      web: web.url,
      dynamodbTable: highScoreTable.name,
    };
  },
});
