# Lead SMS Setup (Twilio + Vercel)

This project can send an SMS alert whenever a lead is saved by `api/save-lead.js`.

SMS body is fixed to:

```text
New lead: <name>
```

## 1. Get Twilio Values

From your Twilio Console, collect:

- `TWILIO_ACCOUNT_SID` (starts with `AC...`)
- `TWILIO_AUTH_TOKEN`
- One sender option:
  - `TWILIO_FROM_NUMBER` (Twilio phone number), or
  - `TWILIO_MESSAGING_SERVICE_SID` (starts with `MG...`)
- Destination number where you want alerts:
  - `LEAD_SMS_TO` in E.164 format, e.g. `+27831234567`

## 2. Add Vercel Environment Variables

In Vercel:

- Project -> `Settings` -> `Environment Variables`

Add:

- `LEAD_SMS_ENABLED=true`
- `LEAD_SMS_TO=+27831234567`
- `LEAD_SMS_TIMEOUT_MS=10000`
- `TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- `TWILIO_AUTH_TOKEN=your-auth-token`
- Use one sender option:
  - `TWILIO_FROM_NUMBER=+1xxxxxxxxxx`
  - OR `TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 3. Redeploy

Redeploy the Vercel project after adding env vars.

## 4. Test

Trigger a lead from the website. Confirm:

- Blob file is created in `leads/...`
- You receive SMS: `New lead: <name>`

## Notes

- If Blob save succeeds but SMS fails, lead data is still saved.
- Twilio trial projects can require verified destination numbers.
