import type { Event, Response } from 'scaleway-functions';
import { payload, result } from './types';
import { createDocument } from 'zod-openapi';
import executeQuery from './executeQuery';

function get(): Response {
  return {
    statusCode: 200,
    body: createDocument({
      openapi: '3.1.0',
      info: {
        title: 'Argon MySQL',
        version: '1.0.0',
      },
      paths: {
        '/': {
          post: {
            summary: 'Execute an SQL Query',
            requestBody: {
              content: {
                'application/json': { schema: payload },
              },
            },
            responses: {
              '200': {
                description: '200 OK',
                content: {
                  'application/json': { schema: result },
                },
              },
            },
          },
        }
      },
    }),
  };
}

async function post(event: Event): Promise<Response> {
  try {
    const auth = event.headers.authorization; // @todo: Use OAuth2 to store secrets behind encryption.
    const data = payload.parse(JSON.parse(event.body));

    return {
      headers: {
        'content-type': 'application/json',
      },
      body: {
        result: await executeQuery(auth as any, data.query),
      },
      statusCode: 200,
    };
  } catch (e) {
    return {
      body: "",
      statusCode: 400,
    }
  }
}

function notFound(): Response {
  return {
    body: "",
    statusCode: 404,
  }
}

export async function handler(event: Event): Promise<Response> {
  if (event.path !== '/') {
    return notFound();
  }

  if (event.requestContext.httpMethod === 'POST') {
    return await post(event);
  }
  if (event.requestContext.httpMethod === 'GET') {
    return get();
  }

  return notFound();
};