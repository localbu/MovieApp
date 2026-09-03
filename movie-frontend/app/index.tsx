import { useState } from "react";
import { View } from "react-native";

import Sidebar from "../components/layout/Sidebar";

import Actors from "../components/actors/Actors";
import Dashboard from "../components/dashboard/Dashboard";
import Directors from "../components/directors/Directors";
import Movies from "../components/movies/Movies";

type MenuType =
  | "dashboard"
  | "movies"
  | "directors"
  | "actors";

export default function HomeScreen() {
  const [activeMenu, setActiveMenu] =
    useState<MenuType>("dashboard");

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard />;

      case "movies":
        return <Movies />;

      case "directors":
        return <Directors />;

      case "actors":
        return <Actors />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <View className="flex-1 flex-row bg-zinc-950">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <View className="flex-1">
        {renderContent()}
      </View>
    </View>
  );
}