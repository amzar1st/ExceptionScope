# GenLayer Project Explorer application

| Field | Suggested entry |
| --- | --- |
| Contribution type | Builder → Projects |
| Project name | ExceptionScope |
| Primary topic | Governance |
| Additional topics | Compliance, Verification |
| One-liner | Verifies whether a version-pinned, issuer-authenticated policy exception covers a specific action and records the clauses behind the verdict. |
| GitHub | https://github.com/amzar1st/ExceptionScope |
| Frontend | https://exceptionscope.tinymule33.chatgpt.site |
| Contract | https://explorer-studio.genlayer.com/address/0xd038f7ee230e18472DFBc9e0c0c50649dDC40312 |
| Deployment | https://explorer-studio.genlayer.com/tx/0x00eec2481b55356a0eba27865ffe988e7cf345e175506996528e28946acd1b68 |
| Supporting evidence | [Live verification](LIVE_VERIFICATION.md) |

Choose the closest matching topics offered by the form.

## Overview

ExceptionScope helps governance and data teams check whether a policy exception actually covers a proposed action. A designated issuer publishes immutable policy clauses and issues exceptions bound to the exact policy version, actor, resource, and time window. The GenLayer contract checks those fields deterministically. For actions that pass, validators independently assess operation and purpose and must agree on the verdict and cited clauses. The public app reads finalized decisions, checks their SHA-256 commitments, and tracks transactions submitted with GenLayer Studio’s built-in account. The live demo compares an internal dataset export, a public release, and a request at the exact expiry boundary.
