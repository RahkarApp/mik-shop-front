import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const src = file => readFileSync(new URL('../src/'+file,import.meta.url), 'utf8');
function runtime(mode,path) {
 const env={NEXT_PUBLIC_DATA_MODE:mode};
 const context={process:{env}, window:{location:{pathname:path}}, module:{exports:{}}};
 runInNewContext(src('utils/demoRoute.js').replace(/\bexport (?=function)/g,'')+'\nmodule.exports={isDemoRuntime,demoHref,isDemoPath};',context);
 return context.module.exports;
}

test('real and preview transport are isolated by pathname; env demo still works',()=>{
 assert.equal(runtime('real','/').isDemoRuntime(),false);
 assert.equal(runtime('real','/profile').isDemoRuntime(),false);
 assert.equal(runtime('real','/demo').isDemoRuntime(),true);
 assert.equal(runtime('real','/demo/cart').isDemoRuntime(),true);
 assert.equal(runtime('demo','/').isDemoRuntime(),true);
 assert.equal(runtime('real','/demolition').isDemoRuntime(),false);
});

test('preview links stay on /demo without double prefix or external URL changes',()=>{
 const {demoHref}=runtime('real','/demo/cart');
 assert.equal(demoHref('/'),'/demo');
 assert.equal(demoHref('/orders/123'),'/demo/orders/123');
 assert.equal(demoHref('/demo/orders/123'),'/demo/orders/123');
 assert.equal(demoHref('https://example.net'), 'https://example.net');
 assert.equal(demoHref('//external.example'), '//external.example');
 assert.equal(runtime('real','/').demoHref('/orders'),'/orders');
});

test('preview subroutes are mapped, store interfaces use preview-aware navigation',()=>{
 const config=readFileSync(new URL('../next.config.mjs',import.meta.url),'utf8');
 assert.match(config,/afterFiles/);
 assert.match(config,/source: '\/demo\/:path\*'/);
 assert.match(src('components/PreviewLink.js'),/demoHref\(href, pathname\)/);
 assert.match(src('services/api.js'),/isDemoRuntime\(\)/);
});
