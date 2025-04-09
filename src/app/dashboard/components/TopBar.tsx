"use client";

import { UserResponseModel } from "@/app/types/ApiResponseModel";
import { UserRead } from "@/app/types/Models";
import axios from "axios";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [user, setUser] = useState<UserRead | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get<UserResponseModel>("/api/user/me");
      if (res.status === 200) {
        setUser(res.data.data);
      }
    };
    fetchUser();
  }, []);
  return (
    <div className="fixed top-0 left-0 h-12 w-full border-b">
      <div className="container mx-auto flex h-full items-center justify-start px-4">
        <div className="ml-auto flex items-center gap-2">
          {user && <div>Welcome, {user.first_name}</div>}
          {/* User Icon Placeholder */}
          <div>Icon</div>
        </div>
      </div>
    </div>
  );
}
