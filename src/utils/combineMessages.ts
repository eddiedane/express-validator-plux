import { Obj } from "../types";

export const combineMessages = (main: Obj, overide: Obj) => {
  for (const fieldName in main) {
    if (!(fieldName in overide)) continue;

    main[fieldName] = { ...main[fieldName], ...overide[fieldName] };
  }

  return main;
};
