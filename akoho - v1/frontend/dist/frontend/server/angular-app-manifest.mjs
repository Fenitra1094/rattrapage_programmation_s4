
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "redirectTo": "/races",
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RMYLWD3O.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/races"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CY7CAXF2.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/clients"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IHUNOXBY.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/fournisseurs"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-4GTX5NTX.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/raisons-mouvements"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-MKZ3YVFJ.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/lots"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-YHZBEJUN.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/lots-mouvements"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-YFZCNGON.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/oeufs-mouvements"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NF4VCSXW.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/prix-nourritures"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-A6ZUTCSA.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/prix-vente-oeufs"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-2CZOXRC3.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/prix-vente-poulets"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LQZULIVK.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/configuration-races"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QJRHFWTW.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/achats-poulets"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-BMOWXPO6.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/ventes-poulets"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-DTMOGIYP.js",
      "chunk-F4CP5NYD.js"
    ],
    "route": "/ventes-oeufs"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 766, hash: 'd0b82f39f21da818e09b4d044d8e73be3b0d749681b47a22be91cfa9dab850c2', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 997, hash: '0aa9b37466631ffda31aa2f21b1ef4a89fcae40b055055a021dbb8a4b51ebe5b', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-YBDYMQBI.css': {size: 157, hash: 'KqREfw5XOz0', text: () => import('./assets-chunks/styles-YBDYMQBI_css.mjs').then(m => m.default)}
  },
};
