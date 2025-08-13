# Provider EHR Launch SMART on FHIR App

A modern React implementation of a SMART on FHIR application demonstrating the EHR launch flow for provider-facing clinical applications.

Healthcare providers need applications that seamlessly integrate with their Electronic Health Record (EHR) systems. This repository demonstrates how to build a SMART on FHIR app that:

- **Launches from within an EHR**: Providers can access the app directly from their EHR workflow without separate logins
- **Maintains clinical context**: Automatically receives the current patient and encounter information from the EHR
- **Handles secure authentication**: Implements the OAuth 2.0 flow with PKCE (Proof Key for Code Exchange) for enhanced security
- **Manages token lifecycle**: Includes token refresh functionality to maintain sessions without re-authentication

![Demo Screenshot](/img/DEMO_1.jpeg)

## Example deployed app

I've provided two example deployments for testing:
[smart-provider-ehr-launch-app-epic.foureighteen.dev](https://smart-provider-ehr-launch-app-epic.foureighteen.dev) and
[smart-provider-ehr-launch-app-cerner.foureighteen.dev](https://smart-provider-ehr-launch-app-cerner.foureighteen.dev).

Note that clicking on these links will not work directly - they need to be launched from the SMART App Launcher or a compatible EHR environment. This means you'll need configure a Cerner or Epic sandbox account first, and use the above links as the launch URL in the SMART App Launcher.

## SMART on FHIR Provider EHR Launch Flow

This app implements the [SMART App Launch Framework](https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html) EHR launch sequence:

1. **EHR initiates launch**: The EHR launches the app with `iss` (FHIR server URL) and `launch` (opaque identifier) parameters
2. **App discovers endpoints**: Uses the FHIR server's `.well-known/smart-configuration` to find OAuth endpoints
3. **Authorization request**: Redirects to the EHR's authorization server with:
   - Client ID
   - Requested scopes (patient/\*.read, launch, openid, etc.)
   - PKCE code challenge for security
   - Launch context from the EHR
4. **Authorization response**: EHR redirects back with an authorization code
5. **Token exchange**: App exchanges the code for access and refresh tokens
6. **API access**: App can now make FHIR API calls with the access token

## Key Features

- **TypeScript & React**: Built with modern tooling for type safety and developer experience
- **PKCE Security**: Implements Proof Key for Code Exchange to prevent authorization code interception
- **Token Management**: React Context-based token storage with automatic expiry tracking
- **Refresh Token Support**: Refreshes expired tokens to maintain user sessions

## Compatibility

Tested with:

- [SMART App Launcher](https://launch.smarthealthit.org) - Reference implementation
- [Cerner's Code Console Sandbox](https://code-console.cerner.com/)
- [Epic's SMART on FHIR Sandbox (Must be logged in to see)](https://fhir.epic.com/Documentation?docId=launching)

## Documentation

- [HL7 SMART App Launch](https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html) - Official specification
- [Cerner's SMART on FHIR Tutorial](https://engineering.cerner.com/smart-on-fhir-tutorial/) - Implementation guide (outdated, but useful for context)

## Getting Started

### Prerequisites

- Node.js 22+ and npm
- Access to the ([SMART Launcher](https://launch.smarthealthit.org) or an account with either [Cerner Code Console](https://code-console.cerner.com/)) or [Epic UserWeb](https://fhir.epic.com/Home/Index)

### Installation

```bash
npm install
```

### Configuration

Edit `src/config.json` to configure your app:

```json
{
  "CLIENT_ID": "your-client-id", // This is a PUBLIC client ID, meant to be used in untrusted clients like web browsers
  "BASE_URL": "http://localhost:5173",
  "STORAGE_TYPE": "local", // or "session"
  "SMART_SCOPES": [
    "launch",
    "fhirUser",
    "profile",
    "openid",
    "patient/*.rs",
    "user/*.rs",
    "online_access"
  ],
  "STORAGE_KEYS": {
    "OAUTH_STATE": "oauth2-state",
    "CODE_VERIFIER": "code-verifier",
    "TOKEN_DATA": "token-data",
    "AUTHORIZATION_URL": "authorization-url",
    "TOKEN_URL": "token-url",
    "FHIR_BASE_URL": "fhir-base-url"
  }
}
```

### Development

```bash
npm run dev
```

This starts the development server at `http://localhost:5173/`.

### Testing with SMART Launcher

You can test the app on localhost using the SMART App Launcher

1. Go to [SMART App Launcher](https://launch.smarthealthit.org)
2. Select a patient and practitioner
3. Enter your app's launch URL: `http://localhost:5173/auth/smart/login`
4. Click "Launch"

The app will receive the launch parameters and guide you through the OAuth flow.

### Testing with Cerner

You can register your app with Cerner's Code Console:
![Cerner Code Console](/img/CERNER_CODE_CONSOLE.jpeg)

Here are settings you can use to configure your app. Note that we use the live demo url here, but you can replace it with the localhost URL if you want to test locally.

![Cerner App Settings](/img/CERNER_APP_CONFIG_1.png)
![Cerner App Product Selection](/img/CERNER_APP_CONFIG_2.png)
