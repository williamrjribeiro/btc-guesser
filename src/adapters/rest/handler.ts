import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HighScore } from '../../game-core/HighScoreAPI';
import { v4 as uuidv4 } from 'uuid';

export const getHighscore: APIGatewayProxyHandlerV2 = async (event) => {
  console.log('[getHighscore] event:', JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify([
      new HighScore('C20,W10,N0', 'HODL', new Date(Date.now() - 300000), uuidv4()),
      new HighScore('C7,W3,N10', 'MOON', new Date(Date.now() - 200000), uuidv4()),
      new HighScore('C2,W1,N0', 'BULL', new Date(Date.now() - 100000), uuidv4()),
    ]),
  };
};

export const postHighscore: APIGatewayProxyHandlerV2 = async (event) => {
  console.log('[postHighscore] event:', JSON.stringify(event, null, 2));

  try {
    if (!event.body) {
      throw new Error('Request body is required');
    }

    const payload = JSON.parse(event.body);
    const highScore = new HighScore(payload._serializedHistory, payload.username, new Date(payload.date), uuidv4());

    return {
      statusCode: 201,
      body: JSON.stringify({
        id: highScore.id,
        date: highScore.date,
      }),
    };
  } catch (error) {
    console.error('[postHighscore] error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error instanceof Error ? error.message : 'Invalid request',
      }),
    };
  }
};
