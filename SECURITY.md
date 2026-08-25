# Security Policy

Do not put keystore passwords, provisioning secrets, or API tokens in `workspace.config.ts` committed to git. Use `{ env: "VAR_NAME" }` or `env:VAR_NAME`, and store values in EAS Secrets or your CI environment.

`plan`, `doctor`, and JSON output redact known secret fields. If you find a case where a secret is printed, please report it.

## Reporting a vulnerability

Use GitHub Security Advisories on this repository. Please do not open a public issue for secrets or RCE in native project mutation.
