# Live verification

- Network: GenLayer Studionet, chain ID 61999.
- [Contract](https://explorer-studio.genlayer.com/address/0xd038f7ee230e18472DFBc9e0c0c50649dDC40312)
- Issuer: `0x56944456AEFf47F7312a4D8c8b712558E86D68Bf` (Studio built-in account).
- Contract source SHA-256: `690e276cc68e42b98c4e39ae699bfb3728405911a33d6d30f47d56ef15965a1a`.
- `npm run verify:live` compares the committed Python source byte-for-byte with the deployment transaction payload. It checks finalized state, transaction execution outcomes, and decision hashes.

| Action | Expected finalized result | Explorer |
| --- | --- | --- |
| Deploy | Successful execution | [Receipt](https://explorer-studio.genlayer.com/tx/0x00eec2481b55356a0eba27865ffe988e7cf345e175506996528e28946acd1b68) |
| Publish policy | Issuer writes immutable policy | [Receipt](https://explorer-studio.genlayer.com/tx/0xaeee0515e8846ee9683a8671ee7daadf0acd4b50351f673a3d44386269e94cd8) |
| Issue exception | Issuer binds exception to policy | [Receipt](https://explorer-studio.genlayer.com/tx/0x2168b625b6114b7dbbd24dc27fc2b6bf601ff2b724cbf9607bc9a305793856a4) |
| Internal analysis | COVERED, P-1 and E-1 | [Receipt](https://explorer-studio.genlayer.com/tx/0xfd3ec48881fa915918e301e115142b5652b923d688f7ac5ea69bfe8a6022dbc1) |
| Public release | OUT_OF_SCOPE, P-1, E-1 and E-2 | [Receipt](https://explorer-studio.genlayer.com/tx/0x161928e1ce681fa98069e87a1576b3c78c8df4980342cf9d0ee8f9e9094aa3d1) |
| Exact expiry | OUT_OF_SCOPE, TIME_WINDOW | [Receipt](https://explorer-studio.genlayer.com/tx/0x305b8c87dfdb0dc87582f3d49a30302e973312b65100f60c6ade00d7a9c0a49b) |
| Unauthorized policy publication | Finalized rollback, Authority only | [Receipt](https://explorer-studio.genlayer.com/tx/0xbf518a4f009ee233ae6a76a4e177cbe0d6288c1fb3629223af3ff989412bbbb6) |

## Reproduce

1. Open the [public app](https://exceptionscope.tinymule33.chatgpt.site). Choose an example. The app reads the record from finalized state and displays the verdict, cited clauses, decision ID, and decision SHA-256. **Track rejected demo** shows the rollback.
2. To submit a new action, edit the action details, then choose **Prepare Studio transaction**.
3. Open [Studio Contracts](https://studio.genlayer.com/contracts) and click **Import Contract** next to **Your Contracts**. Enter the address shown on the site. In **Run and Debug**, select **Normal (Full Consensus)** and expand `verify_action`.
4. Enter the seven arguments in order and send with your Studio built-in account. Paste the transaction hash into the app to track it. Repeat actions resolve to the same decision ID.

The live fixture uses public, fictional clauses. The policy and exception IDs are visible in the example forms. Unit tests cover ambiguous outcomes and validator disagreement. The public demo exercises both semantic verdicts and the deterministic expiry path. A finalization marker alone does not establish execution success.
