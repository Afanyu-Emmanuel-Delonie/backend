"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** The invite data now lives on the backend — the join page fetches it directly by id. */
export default function InvitePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/join?invite=${id}`);
  }, [id, router]);

  return null;
}
