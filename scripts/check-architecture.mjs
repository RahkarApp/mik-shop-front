import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join,relative,dirname,resolve} from 'node:path';
const ROOT=process.cwd(),project=process.env.CHECK_PROJECT||'shapsaz';
const rules=['AGENTS.md','rules/10-web-storefront-project.mdc','rules/20-refactor.mdc'];
const failures=[];const fail=(msg)=>failures.push(msg);
for(const x of rules)if(!existsSync(join(ROOT,x)))fail('Missing required rule: '+x);
if(!existsSync(join(ROOT,'src/app/demo/page.js')))fail('Missing /demo route');
if(!readFileSync(join(ROOT,'src/services/api.js'),'utf8').includes("process.env.NEXT_PUBLIC_DATA_MODE === 'demo'")&&!readFileSync(join(ROOT,'src/services/api.js'),'utf8').includes("process.env.NEXT_PUBLIC_DATA_MODE==='demo'"))fail('Demo must remain environment-controlled');
const src=join(ROOT,'src');let jsFiles=0;
function visit(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory()){visit(p);continue;}if(!p.endsWith('.js')&&!p.endsWith('.mjs'))continue;jsFiles++;
const source=readFileSync(p,'utf8'),rel=relative(ROOT,p);
if(/\b(?:socket\.io|new WebSocket\(|EventSource\()/.test(source))fail('Socket/SSE not allowed: '+rel);
for(const match of source.matchAll(/(?:from\s*|import\s*\(\s*)['"]([^'"\n]+)['"]/g)){
 const mod=match[1];if(!mod.startsWith('@/')&&!mod.startsWith('.'))continue;
 const base=mod.startsWith('@/')?join(src,mod.slice(2)):resolve(dirname(p),mod);
 if(!['','.js','.mjs','/index.js'].some(s=>existsSync(base+s)))fail('Unresolved import '+rel+' -> '+mod);
 if(rel.startsWith('src/components/')&&/(?:services\/|data\/products|data\/store)/.test(mod))fail('UI bypasses Hook/Service: '+rel);
 if(rel.startsWith('src/app/')&&/(?:services\/mockApi|data\/products|data\/store)/.test(mod))fail('Real route imports Mock: '+rel);
}
if(rel.startsWith('src/services/')&&/\buse(?:State|Effect|Reducer|Context)\(/.test(source))fail('React hook in service: '+rel);
}}
visit(src);
const api=readFileSync(join(ROOT,'src/services/api.js'),'utf8');
if(!api.includes("'real'")&&!api.includes('isDemo'))fail('No fail-closed real mode');
if(!api.includes('no-store'))fail('API lacks no-store fetch');
if(!existsSync(join(ROOT,'.env')))fail('Missing runtime environment configuration');
console.log(`${project}: ${jsFiles} JS files, ${rules.length} agent/rule files, ${failures.length} architecture violations`);
for(const e of failures)console.error('- '+e);
if(failures.length)process.exitCode=1;
