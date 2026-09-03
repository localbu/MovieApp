import {
    Clapperboard,
    Film,
    LayoutDashboard,
    UserRound,
    Users,
} from "lucide-react-native";

import { Pressable, Text, View } from "react-native";

type MenuType =
  | "dashboard"
  | "movies"
  | "directors"
  | "actors";

type SidebarProps = {
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
};

export default function Sidebar({
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  const menus = [
    {
      name: "dashboard" as MenuType,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "movies" as MenuType,
      label: "Movies",
      icon: Film,
    },
    {
      name: "directors" as MenuType,
      label: "Directors",
      icon: UserRound,
    },
    {
      name: "actors" as MenuType,
      label: "Actors",
      icon: Users,
    },
  ];

  return (
    <View className="h-full w-64 border-r border-zinc-800 bg-zinc-950 p-5">
      {/* Logo */}
      <View className="mb-10 flex-row items-center gap-3">
        <View className="rounded-xl bg-red-600 p-2">
          <Clapperboard
            size={24}
            color="white"
          />
        </View>

        <Text className="text-xl font-bold text-white">
          Movie App
        </Text>
      </View>

      {/* Menu */}
      <View className="gap-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const isActive =
            activeMenu === menu.name;

          return (
            <Pressable
              key={menu.name}
              onPress={() =>
                setActiveMenu(menu.name)
              }
              className={`flex-row items-center gap-3 rounded-xl px-4 py-3 ${
                isActive
                  ? "bg-red-600"
                  : "bg-transparent"
              }`}
            >
              <Icon
                size={21}
                color={
                  isActive
                    ? "white"
                    : "#A1A1AA"
                }
              />

              <Text
                className={`text-base ${
                  isActive
                    ? "font-semibold text-white"
                    : "text-zinc-400"
                }`}
              >
                {menu.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}