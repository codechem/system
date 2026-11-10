# Figma inspection scripts

Read-only `use_figma` scripts. Replace `NODE_ID` / `SET_ID` before running.

## Step A: find the component sets on the linked node's page

```js
const node = await figma.getNodeByIdAsync('NODE_ID');
let page = node;
while (page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);
return {
  page: page.name,
  linked: { name: node.name, type: node.type },
  sets: page.findAllWithCriteria({ types: ['COMPONENT_SET'] }).map((n) => ({ id: n.id, name: n.name, variants: n.children.length })),
  loose: page.findAllWithCriteria({ types: ['COMPONENT'] }).filter((c) => c.parent.type !== 'COMPONENT_SET').map((n) => ({ id: n.id, name: n.name })),
};
```

## Step B: describe every variant of one set, with bound variable names

```js
const set = await figma.getNodeByIdAsync('SET_ID');
let p = set;
while (p.type !== 'PAGE') p = p.parent;
await figma.setCurrentPageAsync(p);
const vn = async (b) => (b ? (await figma.variables.getVariableByIdAsync(b.id))?.name ?? b.id : undefined);
const paint = async (ps) =>
  Promise.all(
    (ps || [])
      .filter((x) => x.visible !== false)
      .map(async (x) => ({
        c: x.color ? [x.color.r, x.color.g, x.color.b].map((v) => Math.round(v * 255)).join(',') : x.type,
        o: x.opacity,
        v: await vn(x.boundVariables?.color),
      })),
  );
const desc = async (n, d) => {
  const o = { name: n.name, type: n.type, w: Math.round(n.width * 100) / 100, h: Math.round(n.height * 100) / 100 };
  if (n.visible === false) o.hidden = true;
  if ('fills' in n && n.fills !== figma.mixed) { const f = await paint(n.fills); if (f.length) o.fills = f; }
  if ('strokes' in n) { const s = await paint(n.strokes); if (s.length) Object.assign(o, { strokes: s, sw: n.strokeWeight, sa: n.strokeAlign }); }
  if ('cornerRadius' in n && n.cornerRadius) o.r = n.cornerRadius;
  if ('opacity' in n && n.opacity !== 1) o.opacity = n.opacity;
  if ('effects' in n && n.effects.length) o.effects = n.effects.map((e) => ({ t: e.type, spread: e.spread, radius: e.radius }));
  if (n.layoutMode && n.layoutMode !== 'NONE') Object.assign(o, { layout: n.layoutMode, pad: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft], gap: n.itemSpacing });
  if (n.type === 'TEXT') Object.assign(o, { chars: n.characters, font: n.fontName, size: n.fontSize, lh: n.lineHeight, deco: n.textDecoration, ls: n.letterSpacing, case: n.textCase, style: n.textStyleId ? (await figma.getStyleByIdAsync(n.textStyleId))?.name : undefined });
  if (n.boundVariables && Object.keys(n.boundVariables).length) {
    o.bv = {};
    for (const [k, b] of Object.entries(n.boundVariables)) { const one = Array.isArray(b) ? b[0] : b; if (one?.id) o.bv[k] = await vn(one); }
  }
  if (n.type === 'INSTANCE') { const mc = await n.getMainComponentAsync(); o.main = mc && (mc.parent?.type === 'COMPONENT_SET' ? `${mc.parent.name}/${mc.name}` : mc.name); }
  if ('children' in n && d < 3 && n.type !== 'INSTANCE') o.kids = await Promise.all(n.children.map((c) => desc(c, d + 1)));
  return o;
};
const props = set.componentPropertyDefinitions;
const out = {
  description: set.description,
  props: Object.fromEntries(Object.entries(props).map(([k, v]) => [k, { type: v.type, opts: v.variantOptions, def: v.defaultValue }])),
  variants: await Promise.all(set.children.map((c) => desc(c, 0))),
};
const json = JSON.stringify(out);
return json.length > 45000 ? json.slice(0, 45000) : out;
```

## Icon vector paths

Only use this if an icon can't come from Material Icons Round:

```js
return set.findOne((n) => n.type === 'VECTOR').vectorPaths.map((v) => v.data);
```
