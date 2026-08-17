import { NextFunction, Request, Response } from "express";
import { findBinShabibNet192626Properties, upsertBinShabibEstateNetProperty } from "../repositories/sync.repository";

export async function syncProperties(_req: Request, res: Response, next: NextFunction) {
  try {
    const properties = await findBinShabibNet192626Properties();
    let inserted = 0;
    let updated = 0;
    for (const property of properties) {
      (await upsertBinShabibEstateNetProperty(property)) ? inserted++ : updated++;
    }
    return res.json({ success: true, results: { inserted, updated, total: properties.length } });
  } catch (error) { return next(error); }
}
