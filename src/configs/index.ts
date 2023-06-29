import Knex from 'knex';

import { Obj } from '../types';
import { defaultFalsy } from '../utils';

type DBConnection = {
  type: 'mysql';
  name?: string;
  url: string;
};

type Configuration = {
  db?: DBConnection | DBConnection[];
  falsy?: boolean | CallableFunction;
};

export const configurations: Configuration = {
  falsy: defaultFalsy,
};

export const connections: Obj = {};

export function config(configs: Configuration) {
  Object.assign(configurations, configs);

  if (configurations.db) {
    const dbs = Array.isArray(configurations.db)
      ? configurations.db
      : [configurations.db];

    dbs.forEach((db) => {
      const conn: Obj = { type: db.type };

      switch (db.type) {
        case 'mysql':
          const knex = Knex({ client: 'mysql2', connection: db.url });

          conn.client = knex;
          break;
      }

      connections[db.name || 'default'] = conn;
    });
  }
}
