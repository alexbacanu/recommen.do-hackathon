import { useSetAtom } from "jotai";
import { cache } from "react";

import { accountAtom, profileAtom } from "~/lib/atoms/appwrite";
import { account, databases } from "~/lib/clients/appwrite-client";

export const useAppwrite = () => {
  const setAccount = useSetAtom(accountAtom);
  const setProfile = useSetAtom(profileAtom);

  const getAccount = cache(async () => {
    try {
      const response = await account.get();
      if (response) setAccount(response);
      console.log("getAccountSuccess:", response);
    } catch (error) {
      setAccount(null);
      console.log("getAccountError:", error);
    }
  });

  const getProfile = cache(async () => {
    try {
      const { documents } = await databases.listDocuments("main", "profile");
      if (documents.length !== 0 && documents[0]) setProfile(documents[0]);
      console.log("getProfileSuccess:", documents[0]);
    } catch (error) {
      setProfile(null);
      console.log("getProfileError:", error);
    }
  });

  const signOut = cache(async () => {
    try {
      await account.deleteSession("current");
      setAccount(null);
      console.log("signOutSuccess:");
    } catch (error) {
      console.log("signOutError:", error);
    }
  });

  return { getAccount, getProfile, signOut };
};
