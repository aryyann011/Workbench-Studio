const fs = require('fs');
const path = require('path');

const files = [
  'app/sign-in/[[...sign-in]]/page.tsx',
  'app/sign-up/[[...sign-up]]/page.tsx'
];

const replacements = [
  { from: /bg-black/g, to: 'bg-background' },
  { from: /bg-neutral-950\/40/g, to: 'bg-card/40' },
  { from: /bg-neutral-950\/80/g, to: 'bg-card/80' },
  { from: /border-neutral-800/g, to: 'border-border' },
  { from: /bg-neutral-900/g, to: 'bg-muted' },
  { from: /bg-neutral-900\/40/g, to: 'bg-muted/40' },
  { from: /bg-neutral-900\/60/g, to: 'bg-muted/60' },
  { from: /text-neutral-400/g, to: 'text-muted-foreground' },
  { from: /text-white/g, to: 'text-foreground' },
  { from: /text-black/g, to: 'text-background' },
  { from: /text-neutral-500/g, to: 'text-muted-foreground' },
  { from: /bg-\[\#050507\]\/90/g, to: 'bg-card/90' },
  { from: /border-neutral-850/g, to: 'border-border' },
  { from: /border-neutral-900/g, to: 'border-border' },
  { from: /border-neutral-700/g, to: 'border-border' },
  { from: /hover:border-neutral-700/g, to: 'hover:border-foreground/20' },
  { from: /hover:bg-neutral-800/g, to: 'hover:bg-muted/80' },
  { from: /hover:bg-neutral-100/g, to: 'hover:bg-foreground/90' },
  { from: /hover:bg-neutral-200/g, to: 'hover:bg-foreground/90' },
  { from: /hover:border-neutral-800/g, to: 'hover:border-border/80' },
  { from: /hover:text-neutral-200/g, to: 'hover:text-foreground/80' },
  { from: /text-neutral-600/g, to: 'text-muted-foreground' },
  { from: /disabled:bg-neutral-800/g, to: 'disabled:bg-muted' },
  { from: /disabled:text-neutral-500/g, to: 'disabled:text-muted-foreground' },
  { from: /border-l-neutral-700\/30/g, to: 'border-l-border/50' },
  { from: /border-r-neutral-700\/30/g, to: 'border-r-border/50' },
  { from: /border-b-neutral-700\/30/g, to: 'border-b-border/50' },
  { from: /border-t-neutral-700\/30/g, to: 'border-t-border/50' },
  { from: /bg-white/g, to: 'bg-foreground' },
  { from: /border-black/g, to: 'border-background' }
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const returnIndex = content.indexOf('return (');
  if (returnIndex === -1) continue;
  
  let beforeReturn = content.substring(0, returnIndex);
  let afterReturn = content.substring(returnIndex);
  
  for (const { from, to } of replacements) {
    afterReturn = afterReturn.replace(from, to);
  }
  
  fs.writeFileSync(filePath, beforeReturn + afterReturn, 'utf-8');
  console.log(`Updated ${file}`);
}
