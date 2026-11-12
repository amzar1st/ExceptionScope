export const address = '0xd038f7ee230e18472DFBc9e0c0c50649dDC40312';
export const authority = '0x56944456AEFf47F7312a4D8c8b712558E86D68Bf';
export const explorer = 'https://explorer-studio.genlayer.com';
export const policy = 'c4c047fe9449da2b483cf4205b8b92198dbf0c9fc7650d77f2ba695c0bab626e';
export const exception = '8323765eba77851f346b168c48f832cd38be7585c2e4a32b7be7b69ca842d662';
export const transactions = {
  deploy: '0x00eec2481b55356a0eba27865ffe988e7cf345e175506996528e28946acd1b68',
  publish: '0xaeee0515e8846ee9683a8671ee7daadf0acd4b50351f673a3d44386269e94cd8',
  issue: '0x2168b625b6114b7dbbd24dc27fc2b6bf601ff2b724cbf9607bc9a305793856a4',
};
const base = { actor: 'research-team', resource: 'dataset-17', operation: 'Export', timestamp: 1794441600 };
export const rejectedPublication = "0xbf518a4f009ee233ae6a76a4e177cbe0d6288c1fb3629223af3ff989412bbbb6";
export const demos = [
  { label: 'Internal analysis', verdict: 'COVERED', action: { ...base, purpose: 'Internal analysis' }, hash: '0xfd3ec48881fa915918e301e115142b5652b923d688f7ac5ea69bfe8a6022dbc1' },
  { label: 'Public release', verdict: 'OUT_OF_SCOPE', action: { ...base, purpose: 'Public release' }, hash: '0x161928e1ce681fa98069e87a1576b3c78c8df4980342cf9d0ee8f9e9094aa3d1' },
  { label: "At expiry", verdict: "OUT_OF_SCOPE", action: { ...base, purpose: "Internal analysis", timestamp: 1796083200 }, hash: "0x305b8c87dfdb0dc87582f3d49a30302e973312b65100f60c6ade00d7a9c0a49b" },
];
