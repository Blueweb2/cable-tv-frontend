const fs = require('fs');
const path = require('path');

const files = [
  'app/staff/attendance/page.tsx',
  'app/staff/profile/page.tsx',
  'app/staff/availability/page.tsx',
  'app/staff/schedule/page.tsx'
].map(f => path.join('c:/Users/ADMIN/OneDrive/Desktop/cable/cable-tv-frontend', f));

const replacements = [
  { regex: /border-\\[#e8e1d8\\]/g, rep: 'border-slate-800' },
  { regex: /border-\\[#eee8e1\\]/g, rep: 'border-slate-800' },
  { regex: /border-\\[#e3dbd2\\]/g, rep: 'border-slate-700' },
  { regex: /text-\\[#29241f\\]/g, rep: 'text-white' },
  { regex: /text-\\[#403a34\\]/g, rep: 'text-slate-200' },
  { regex: /text-\\[#9a6c37\\]/g, rep: 'text-cyan-400' },
  { regex: /text-\\[#a7773f\\]/g, rep: 'text-cyan-400' },
  { regex: /text-\\[#b8894b\\]/g, rep: 'text-cyan-400' },
  { regex: /text-\\[#756d64\\]/g, rep: 'text-slate-400' },
  { regex: /text-\\[#8d847b\\]/g, rep: 'text-slate-400' },
  { regex: /text-\\[#9b938a\\]/g, rep: 'text-slate-400' },
  { regex: /bg-white/g, rep: 'bg-[#0f172a]' },
  { regex: /bg-\\[#fbf8f4\\]/g, rep: 'bg-slate-900/50' },
  { regex: /bg-\\[#f7efe4\\]/g, rep: 'bg-cyan-950/30' },
  { regex: /bg-\\[#fdfbf8\\]/g, rep: 'bg-slate-900' },
  { regex: /bg-\\[#fdfcfb\\]/g, rep: 'bg-slate-900/50' },
  { regex: /bg-\\[#faf8f5\\]/g, rep: 'bg-slate-800/50' },
  { regex: /bg-\\[#f7f2eb\\]/g, rep: 'bg-slate-900/80' },
  { regex: /bg-\\[#eee8e1\\]/g, rep: 'bg-slate-800' },
  { regex: /bg-\\[#9a6c37\\]/g, rep: 'bg-cyan-600' },
  { regex: /bg-\\[#b8894b\\]/g, rep: 'bg-cyan-600' },
  { regex: /hover:bg-\\[#7e582d\\]/g, rep: 'hover:bg-cyan-500' },
  { regex: /hover:bg-\\[#a7773f\\]/g, rep: 'hover:bg-cyan-500' },
  { regex: /bg-\\[#557555\\]/g, rep: 'bg-emerald-600' },
  { regex: /hover:bg-\\[#456345\\]/g, rep: 'hover:bg-emerald-500' },
  { regex: /bg-\\[#edf5ed\\]/g, rep: 'bg-emerald-500/20' },
  { regex: /text-\\[#557555\\]/g, rep: 'text-emerald-400' },
  { regex: /text-gray-900/g, rep: 'text-white' },
  { regex: /text-gray-800/g, rep: 'text-slate-200' },
  { regex: /text-gray-700/g, rep: 'text-slate-300' },
  { regex: /text-gray-600/g, rep: 'text-slate-400' },
  { regex: /text-gray-500/g, rep: 'text-slate-400' },
  { regex: /text-gray-400/g, rep: 'text-slate-500' },
  { regex: /text-gray-300/g, rep: 'text-slate-600' },
  { regex: /border-gray-200/g, rep: 'border-slate-700' },
  { regex: /divide-\\[#eee8e1\\]/g, rep: 'divide-slate-800' },
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(({regex, rep}) => {
      content = content.replace(regex, rep);
    });
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  } else {
    console.log('Not found', file);
  }
});
