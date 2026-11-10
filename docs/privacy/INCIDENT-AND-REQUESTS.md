# Privacy request, retention and incident playbook

**Status:** Draft operational procedure; not evidence it has been deployed or tested.
**Scope:** shashwataneja.com portfolio. Keep actual correspondence, incidents, evidence and identities in restricted storage, not public issues or commits.

## Privacy requests
1. Receive requests at `connect@shashwataneja.com` with the subject `Privacy request` or `Privacy grievance`. First verify the mailbox receives mail.
2. Record only the request type, date, status, applicable deadline and minimal contact details in access-restricted storage. Do not collect ID documents by default.
3. Verify ownership using a proportional method, such as replying through the original correspondence address; request stronger verification only if needed before disclosing sensitive data.
4. Locate the relevant mailbox messages and any other provider-side data confirmed in the processing register.
5. Determine whether applicable law permits access, correction, deletion, withdrawal or nomination, and whether legal retention or security evidence must be preserved.
6. Respond clearly, document the action and ensure relevant processors receive deletion/correction instructions when appropriate.
7. Publish and track the applicable grievance-response period. The DPDP Rules' 90-day maximum applies when the rule is in force and applicable.
8. Review storage policies periodically; do not invent a uniform retention period until providers and lawful requirements are identified.

## Incident response
1. **Identify and contain:** On suspicious account access, unauthorised publication, mailbox compromise or exposed information, preserve evidence, disable compromised credentials/sessions and contain the issue without deleting forensic records.
2. **Assess impact:** Record what happened, when it was discovered, affected data/processors/users, likely consequences, and action taken. Determine whether a personal data breach occurred.
3. **Escalate:** Involve relevant hosting, Cloudflare, email and legal contacts. Confirm other applicable Indian reporting requirements, which can differ from DPDP deadlines.
4. **Notify when required:** Under DPDP Rule 7 **when operative and applicable**, notify affected Data Principals **without delay**; notify the Board **without delay** with an initial description and provide the required detailed update **within 72 hours** after awareness, unless the Board grants longer on written request. Never wait for a complete investigation before assessing the first notification.
5. **Recover:** Patch the root cause, rotate affected secrets, restore trusted content, verify backup integrity and test from a clean session.
6. **Learn:** Document cause, containment, notifications, access changes and follow-up actions privately. Reconcile all notices and retention decisions with current legal advice.

## Hardening checklist for account owners
- DNS/Cloudflare: MFA/passkeys, recovery, zone access review, HTTPS and cache rules, edge security headers.
- Code/GitHub: MFA, branch protection, minimal collaborators and token privileges, optional secret scanning.
- Email: MFA/passkeys, SPF/DKIM/DMARC, trusted recovery methods, mailbox forwarding rules and sent/received privacy-request test.
- Hosting: access roles, deployment protection, backups, log access and retention, vendor terms.
- Production: CSP violation review, security header scan, HTTPS/TLS independent scan, privacy notice live, no unexpected analytics.

This document is a readiness checklist, not a completed test record.
