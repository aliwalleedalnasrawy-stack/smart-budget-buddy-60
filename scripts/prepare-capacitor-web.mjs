import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const webDir = join(process.cwd(), 'dist', 'client');
const assetsDir = join(webDir, 'assets');

const files = readdirSync(assetsDir);
const cssFile = files.find((file) => /^styles-.*\.css$/.test(file));
const jsFiles = files
  .filter((file) => /^index-.*\.js$/.test(file))
  .map((file) => join(assetsDir, file))
  .sort((a, b) => statSync(a).size - statSync(b).size);

if (!cssFile || jsFiles.length === 0) {
  throw new Error('Unable to find built CSS/JS assets for Capacitor. Run npm run build first.');
}

const entryScript = relative(webDir, jsFiles[0]).replaceAll('\\', '/');
const stylesheet = `assets/${cssFile}`;

writeFileSync(
  join(webDir, 'index.html'),
  `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#000000" />
    <title>ميزانيتي الذكية</title>
    <link rel="stylesheet" href="./${stylesheet}" />
    <link rel="manifest" href="./manifest.webmanifest" />
  </head>
  <body>
    <script type="module" src="./${entryScript}"></script>
  </body>
</html>
`,
);

console.log(`Prepared Capacitor web entry at ${join(webDir, 'index.html')}`);