import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { useCashBook } from "./useCashBook";

import { useAuth } from "../contexts/AuthContext";

type CurrentMember = {

  memberId: string;

  profileId: string;

};

export function useCurrentMember() {

  const { user } = useAuth();

  const {
    selectedCashBook,
  } = useCashBook();

  const [currentMember, setCurrentMember] =
    useState<CurrentMember | null>(null);

  useEffect(() => {

    async function loadMember() {

      if (
        !user ||
        !selectedCashBook
      ) {

        setCurrentMember(null);

        return;

      }

      const {
        data,
        error,
      } = await supabase
        .from("group_members")
        .select("id")
        .eq(
          "group_id",
          selectedCashBook.id
        )
        .eq(
          "user_id",
          user.id
        )
        .single();

      if (error || !data) {

        setCurrentMember(null);

        return;

      }

      setCurrentMember({

        memberId: data.id,

        profileId: user.id,

      });

    }

    void loadMember();

  }, [
    user,
    selectedCashBook,
  ]);

  return currentMember;

}