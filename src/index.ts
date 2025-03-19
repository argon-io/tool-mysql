import type { Event, Response } from 'scaleway-functions';
import { payload, result } from './types';
import { createDocument } from 'zod-openapi';
import executeQuery from './executeQuery';
import { z } from 'zod';

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
            security: [
              {
                ApiKeyAuth: [],
              },
            ],
          },
        }
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'authorization',
            bearerFormat: 'base64',
            description: 'Example: mysql://username:password@host:port/databasename',
          },
        },
      },
    }),
  };
}

const authSchema = z.object({
  hostname: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  pathname: z.string().optional(),
  port: z.string().optional(),
  protocol: z.literal('mysql:'),
});

async function post(event: Event): Promise<Response> {
  try {
    const decodedAuth = Buffer.from((event.headers.authorization.toString()).split(' ').pop()!, 'base64').toString('utf-8');
    const auth = authSchema.parse(new URL(decodedAuth));
    const data = payload.parse(JSON.parse(event.body));

    return {
      headers: {
        'content-type': 'application/json',
      },
      body: {
        result: await executeQuery({
          host: auth.hostname,
          username: auth.username,
          password: auth.password,
          database: auth.pathname ? auth.pathname.substring(1) : undefined,
          port: auth.port ? Number(auth.port) : undefined,
        }, data.query),
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