import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "ميزانيتي الذكية" },
      { name: "description", content: "تطبيق الميزانية الشهرية الذكية - تتبع الدخل والمصروفات والادخار بسهولة." },
      { name: "theme-color", content: "#000000" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "ميزانيتي" },
      { property: "og:title", content: "ميزانيتي الذكية" },
      { property: "og:description", content: "تطبيق الميزانية الشهرية الذكية - تتبع الدخل والمصروفات والادخار بسهولة." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "ميزانيتي الذكية" },
      { name: "twitter:description", content: "تطبيق الميزانية الشهرية الذكية - تتبع الدخل والمصروفات والادخار بسهولة." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/50f845fd-ff10-4f2f-ad74-53c962746b49/id-preview-243d65b7--cdd4ac26-a804-4e4a-985d-aef6895ec2f7.lovable.app-1776715590476.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/50f845fd-ff10-4f2f-ad74-53c962746b49/id-preview-243d65b7--cdd4ac26-a804-4e4a-985d-aef6895ec2f7.lovable.app-1776715590476.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/app-icon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/app-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
