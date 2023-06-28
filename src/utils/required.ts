import { Request } from "express";
import { QV_REQUEST_STORE } from "../constants";

export function required({
  on: bool = true,
  req,
  path,
  location,
}: {
  req: Request;
  path: string;
  location: string;
  on?: boolean | (() => boolean);
}) {
  if (!location) throw new Error("required(): location not set");

  const request: any = req; // eslint-disable-line
  const field = request[QV_REQUEST_STORE].fields[path];
  request[QV_REQUEST_STORE].fields[path] = { ...field, required: bool, location };
}
