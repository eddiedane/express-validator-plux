import { connections } from '../configs';

export function getDbConnection(name: string) {
  const db = connections[name];

  if (!db) throw new Error(`[${name}] db connection not found.`);

  return db;
}
