"use client";

import { ChevronDown, CircleUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const navItems = [
    {
      title: "アンケート調査",
      id: "survey",
      dropdownItems: ["アンケート情報一覧"],
    },
    {
      title: "管理",
      id: "admin",
      dropdownItems: ["ユーザー管理", "設定"],
    },
    {
      title: "マニュアル",
      id: "manual",
      dropdownItems: [],
    },
  ];

  const userMenuItems = [
    { label: "ユーザー情報", isTitle: true },
    { label: "パスワード変更", isTitle: false },
    { label: "通知管理", isTitle: false },
    { label: "ログアウト", isTitle: true },
  ];

  return (
    <header className="relative h-16 bg-[#F9F9F9] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)]">
      <div className="flex h-full items-center justify-between px-6">
                 <Link href="/" className="relative h-[50px] w-[272px]">
          {imgError ? (
            <div className="h-full w-full flex items-center">
              <span className="text-[#138FB5] font-bold text-2xl leading-none">SurveyBridge</span>
            </div>
          ) : (
            <Image
              src="/logo.png"
              alt="SurveyBridge"
              fill
              className="object-contain object-left"
              priority
              onError={() => setImgError(true)}
            />
          )}
        </Link>

        <nav className="flex items-center gap-12">
          <div className="flex gap-2">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  className={`flex h-16 items-center gap-3 px-4 font-bold text-[#202020] hover:bg-[#F4F7F9] ${
                    activeDropdown === item.id ? "bg-[#F4F7F9]" : ""
                  }`}
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === item.id ? null : item.id,
                    )
                  }
                >
                  <span className="text-base tracking-[0.04em]">
                    {item.title}
                  </span>
                  {item.dropdownItems.length > 0 && (
                    <ChevronDown
                      className={`h-4 w-4 text-[#9E9E9E] transition-transform ${
                        activeDropdown === item.id ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {activeDropdown === item.id &&
                  item.dropdownItems.length > 0 && (
                    <div className="absolute left-0 top-full z-10 min-w-full rounded-b bg-[#F4F7F9] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)]">
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem}
                          href={
                            dropdownItem === "アンケート情報一覧"
                              ? "/surveys"
                              : "#"
                          }
                          className="block px-4 py-3 text-sm font-bold tracking-[0.04em] text-[#202020] hover:bg-[#e8ecef]"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {dropdownItem}
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex h-16 w-14 items-center justify-center hover:bg-[#F4F7F9]"
              onClick={() =>
                setActiveDropdown(activeDropdown === "user" ? null : "user")
              }
            >
              <CircleUser className="h-8 w-8 text-[#202020]" />
            </button>

            {activeDropdown === "user" && (
              <div className="absolute right-0 top-full z-10 w-48 rounded-b bg-[#F9F9F9] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)]">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href="#"
                    className={`block px-4 py-3 text-sm ${
                      item.isTitle
                        ? "font-bold"
                        : "pl-8 font-medium hover:bg-[#e8ecef]"
                    } tracking-[0.04em] text-[#202020]`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
