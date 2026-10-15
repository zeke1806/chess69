import { beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

const forbidden = (): never => {
  throw new Error(
    'Effet externe interdit dans les tests isolés : injecter une dépendance en mémoire.',
  );
};

beforeEach(() => {
  jest.spyOn(globalThis, 'fetch').mockImplementation(forbidden);
  jest.spyOn(http, 'request').mockImplementation(forbidden);
  jest.spyOn(http, 'get').mockImplementation(forbidden);
  jest.spyOn(https, 'request').mockImplementation(forbidden);
  jest.spyOn(https, 'get').mockImplementation(forbidden);
  jest.spyOn(net.Socket.prototype, 'connect').mockImplementation(forbidden);
  jest.spyOn(net.Server.prototype, 'listen').mockImplementation(forbidden);
  for (const method of [
    'writeFileSync',
    'appendFileSync',
    'mkdtempSync',
    'mkdirSync',
    'rmSync',
    'unlinkSync',
  ] as const) {
    jest.spyOn(fs, method).mockImplementation(forbidden);
  }
  for (const method of ['writeFile', 'appendFile', 'mkdtemp', 'mkdir', 'rm', 'unlink'] as const) {
    jest.spyOn(fsPromises, method).mockImplementation(forbidden);
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});
