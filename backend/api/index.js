'use strict';

require('reflect-metadata');

const express = require('express');

let cachedHandler = null;

async function getHandler() {
  if (cachedHandler) return cachedHandler;

  // Importa o Nest já compilado (garante decorator metadata)
  const { createNestApp } = require('../dist/bootstrap');

  const expressApp = express();
  await createNestApp(expressApp);

  cachedHandler = (req, res) => expressApp(req, res);
  return cachedHandler;
}

module.exports = async (req, res) => {
  const handler = await getHandler();
  return handler(req, res);
};
