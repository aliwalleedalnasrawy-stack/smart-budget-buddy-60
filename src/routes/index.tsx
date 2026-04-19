import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "@/legacy/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ميزانيتي الذكية - Smart Monthly Budget" },
      {
        name: "description",
        content:
          "تطبيق الميزانية الشهرية الذكية: تتبع الدخل والمصروفات والادخار بسهولة.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, #020617 0%, #040C1A 50%, #020617 100%)",
        }}
      />
    );
  }

  return <App />;
}
