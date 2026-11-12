# ExceptionScope

Verify whether a specific action is covered by an authenticated, time-bound policy exception. A blanket reference to an exception can hide a mismatch in purpose, actor, resource, policy version, or time. ExceptionScope produces an auditable, clause-linked decision about the supplied action.

- [Public app](https://exceptionscope.tinymule33.chatgpt.site)
- [Studionet contract](https://explorer-studio.genlayer.com/address/0xd038f7ee230e18472DFBc9e0c0c50649dDC40312)
- [Live verification and reproduction](docs/LIVE_VERIFICATION.md)
- [Project Explorer submission details](docs/SUBMISSION.md)

## How it works

1. The deployer is the issuer. Its Studio account publishes policy clauses and issues exceptions bound to the exact policy content hash. The exception sets a specific actor, resource and UTC Unix-time interval.
2. Anyone may submit an action for review. The contract compares version, actor, resource, and the inclusive-start, exclusive-end interval deterministically.
3. For actions that pass those checks, GenLayer validators independently evaluate operation and purpose against the pinned clauses. Consensus requires the same verdict and normalized clause references. If the network cannot reach agreement, a successful decision is not written.
4. The public app reads finalized decisions and cited clauses from Studionet, verifies their SHA-256 commitments, and tracks Studio transactions. It prepares inputs for Studio's built-in account so reviewers can submit without an extension.

The demo uses fictional records issued on-chain by the authority. It has no dependency on a mutable document URL. Production integrations can publish approved, public policy excerpts via a designated issuer and use decisions as audit evidence. The contract assesses declared action details. The caller and downstream system remain responsible for proving the action occurred and enforcing operational access. Keep confidential information off public chain state. Issuer rotation and revocation would require a separate design.

## Run locally

```sh
npm ci
npm run dev
npm test
python -m unittest discover -s tests -v
npm run verify:live
npm run build
```

The contract is standalone in [contracts/exception_scope.py](contracts/exception_scope.py). Python tests use GenVM test doubles. The live verifier checks actual RPC receipts, state and deployed source.
