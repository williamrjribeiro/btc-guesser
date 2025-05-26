import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HighScore } from '../../game-core/HighScoreAPI';
import { HighScoreRepo } from '../dynamodb/HighScoreRepo';

const highScoreRepo = new HighScoreRepo();

export const getHighscore: APIGatewayProxyHandlerV2 = async (event) => {
  console.log('[getHighscore] event:', JSON.stringify(event, null, 2));

  try {
    const highScores = await highScoreRepo.listHighScores();
    return {
      statusCode: 200,
      body: JSON.stringify(highScores),
    };
  } catch (error) {
    console.error('[getHighscore] error:', error);
    return buildBadResponse(500, 'Failed to fetch high scores');
  }
};

export const postHighscore: APIGatewayProxyHandlerV2 = async (event) => {
  console.log('[postHighscore] event:', JSON.stringify(event, null, 2));

  try {
    if (!event.body) {
      return buildBadResponse(400, 'Request body is required');
    }

    const payload = JSON.parse(event.body);
    const highScore = new HighScore(payload._serializedHistory, payload.username, new Date(payload.date));
    const result = await highScoreRepo.saveHighScore(highScore);

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('[postHighscore] error:', error);

    if (error instanceof Error && error.message.includes('Invalid serialized history format')) {
      return buildBadResponse(400, error.message);
    }

    return buildBadResponse(500, 'Internal server error');
  }
};

const buildBadResponse = (statusCode: number, message: string) => ({ statusCode, body: JSON.stringify({ message }) });
