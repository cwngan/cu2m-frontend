"use client";

import { apiClient } from "@/apiClient";
import { UserResponseModel } from "@/app/types/ApiResponseModel";
import { UserRead } from "@/app/types/Models";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function TopBar() {
  const [user, setUser] = useState<UserRead | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const res = await apiClient.get<UserResponseModel>("/api/user/me");
      if (res.status === 200) {
        setUser(res.data.data);
      }
    };
    fetchUser();
  }, []);
  const logoutHandler = useCallback<MouseEventHandler>((e) => {
    e.preventDefault();
    apiClient
      .post("/api/user/logout")
      .then((res) => {
        if (res.status === 200) {
          window.location.href = "/login";
        }
      })
      .catch((err) => {
        console.error("Logout failed", err);
      });
  }, []);
  return (
    <div className="from-neutral-60 via0-neutral-300 fixed top-0 left-0 z-30 h-12 w-full border-white bg-gradient-to-br from-white to-neutral-300 shadow-md">
      <div className="container mx-auto flex h-full items-center justify-end px-4">
        <div className="">
          <Image
            src="/cu2m_icon_allBlack.png"
            width={32}
            height={32}
            className="text-neutral-800"
            alt="Icon"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user && <div>Welcome, {user.first_name}</div>}
          {/* User Icon Placeholder */}
          <div
            className="cursor-pointer hover:underline"
            onClick={logoutHandler}
          >
            Logout
          </div>
        </div>
      </div>
    </div>
  );
}
