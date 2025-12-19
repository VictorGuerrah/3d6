import 'reflect-metadata'
import express from 'express'
import type { Request, Response } from 'express'
import { createNestApp } from '../src/bootstrap'

let cachedHandler: ((req: Request, res: Response) => unknown) | null = null

async function getHandler() {
  if (cachedHandler) return cachedHandler

  const expressApp = express()
  await createNestApp(expressApp)

  cachedHandler = (req, res) => expressApp(req, res)
  return cachedHandler
}

export default async function handler(req: Request, res: Response) {
  const h = await getHandler()
  return h(req, res)
}
