import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { HighScore } from '../../game-core/HighScoreAPI';
import type { HighScoreRepository, ListHighScore, SaveHighScore } from '../../game-core/HighScoreRepository';
import { Resource } from 'sst';
import { v4 as uuidv4 } from 'uuid';

export class HighScoreRepo implements HighScoreRepository {
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    const dbClient = new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(dbClient);
  }

  listHighScores: ListHighScore = async () => {
    const params: QueryCommandInput = {
      TableName: Resource.HighScore.name,
      IndexName: 'ScoreIndex',
      KeyConditionExpression: 'cryptoSymbol = :cryptoSymbol',
      ExpressionAttributeValues: {
        ':cryptoSymbol': 'BTC', // TODO: make this dynamic
      },
      ScanIndexForward: false, // Sort in descending order (highest scores first)
      Limit: 100,
    };

    try {
      const { Items } = await this.client.send(new QueryCommand(params));
      return (Items || []).map((item) => {
        return new HighScore(item.serializedHistory, item.username, new Date(item.date), item.id);
      });
    } catch (error) {
      console.error('Error fetching high scores:', error);
      throw new Error('Failed to fetch high scores');
    }
  };

  saveHighScore: SaveHighScore = async (highScore: HighScore) => {
    // Create a composite sort key that combines score and date
    // Format: SCORE#<score>#DATE#<iso-date>
    // This ensures that when scores are equal, the most recent date comes first
    const scoreKey = `SCORE#${highScore.score.toString().padStart(3, '0')}#DATE#${highScore.date.toISOString()}`;

    const item = {
      id: uuidv4(),
      username: highScore.username,
      score: highScore.score,
      cryptoSymbol: 'BTC',
      scoreKey,
      date: highScore.date.toISOString(),
      serializedHistory: highScore.serializedHistory,
    };

    try {
      await this.client.send(
        new PutCommand({
          TableName: Resource.HighScore.name,
          Item: item,
        }),
      );

      return {
        id: item.id,
        date: highScore.date,
      };
    } catch (error) {
      console.error('Error saving high score:', error);
      throw new Error('Failed to save high score');
    }
  };
}
