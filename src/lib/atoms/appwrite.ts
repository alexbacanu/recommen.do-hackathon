import type { Models } from "appwrite/types/models";

import { atom } from "jotai";

export const accountAtom = atom<null | Models.User<Models.Preferences>>(null);
export const profileAtom = atom<null | Models.Document>(null);

export const isLoadingAtom = atom<boolean>(true);

export const jwtAtom = atom<null | Models.Jwt>(null);
