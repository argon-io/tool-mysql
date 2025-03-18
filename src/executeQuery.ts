import mysql, { QueryResult } from 'mysql2/promise';
import { config } from './types';
import type { z } from 'zod';

export default async function executeQuery(settings: z.infer<typeof config>, query: string): Promise<string | QueryResult> {
  let socket;

  try {
    socket = await mysql.createConnection({
      host: settings.host,
      user: settings.username,
      password: settings.password,
      database: settings.database,
    });
  } catch (err) {
    return `SQLSTATE[${(err as any).sqlState}]: Failed to connect to the database.`;
  }

  try {
    const [results] = await socket.query(query);

    return results;
  } catch (err) {
    return `SQLSTATE[${(err as any).sqlState}]: ${(err as any).sqlMessage}`;
  } finally {
    // Close the connection if possible.
    try {
      await socket.end();
    } catch (e) { }
  }
}