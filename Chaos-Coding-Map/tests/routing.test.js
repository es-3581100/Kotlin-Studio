import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {indexGraph} from '../src/core/graph.js';import {findRoute} from '../src/core/routing.js';import {searchNodes} from '../src/core/search.js';import {trainQ,traceQ} from '../src/core/qlearning.js';
const raw=JSON.parse(fs.readFileSync(new URL('../data/graph.json',import.meta.url)));const g=indexGraph(raw);
const id=t=>g.nodes.find(n=>n.title===t)?.id;
test('seed graph preserved',()=>{assert.equal(raw.counts.seedNodes,40);assert.equal(raw.counts.seedEdges,102);assert.equal(g.edges.filter(e=>e.origin==='graph-data.json').length,102)});
test('search finds required concepts and aliases',()=>{for(const q of ['Mandelbrot set','OPENRNDR','GPU shader','Lyapunov exponent'])assert.ok(searchNodes(g,q,1)[0],q)});
test('shortest route Mandelbrot to Mandelbulb exists',()=>{const r=findRoute(g,id('Mandelbrot set'),id('Mandelbulb'),'shortest');assert.ok(r);assert.equal(r.nodes[0],id('Mandelbrot set'));assert.equal(r.nodes.at(-1),id('Mandelbulb'))});
test('implementation path reaches OPENRNDR shader domain',()=>{const r=findRoute(g,id('Mandelbrot set'),id('Shaders & GPU'),'implementation');assert.ok(r);assert.equal(r.nodes.at(-1),id('Shaders & GPU'))});
test('lyapunov can route to animation',()=>{const r=findRoute(g,id('Lyapunov exponent'),id('Animation & Time'),'chaos');assert.ok(r)});
test('Q learner produces a trace',()=>{const start=id('Mandelbrot set'),goal=id('Mandelbulb');const Q=trainQ(g,{start,goal,episodes:400});assert.ok(Object.keys(Q).length>0);const r=traceQ(g,start,goal,Q);assert.ok(r.nodes.length>1)});

test('requested OPENRNDR journey exists edge-for-edge',()=>{const chain=['OPENRNDR','Shaders & GPU','Fractal rendering','Orbit iteration','Julia set','Complex dynamics'];for(let i=0;i<chain.length-1;i++){const a=id(chain[i]),b=id(chain[i+1]);assert.ok(g.edges.some(e=>(e.source===a&&e.target===b)||(e.source===b&&e.target===a)),`${chain[i]} -> ${chain[i+1]}`)}});
test('requested Lyapunov journey exists edge-for-edge',()=>{const chain=['Lyapunov exponent','Chaos','Iterative map','Visualization','Animation & Time'];for(let i=0;i<chain.length-1;i++){const a=id(chain[i]),b=id(chain[i+1]);assert.ok(g.edges.some(e=>(e.source===a&&e.target===b)||(e.source===b&&e.target===a)),`${chain[i]} -> ${chain[i+1]}`)}});
