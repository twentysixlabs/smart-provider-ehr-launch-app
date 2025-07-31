# Provider EHR Launch SMART On FHIR App

This is an example React application that is an example of a SMART On FHIR app that can be launched from a provider EHR using the Provider EHR Flow. This means that this is an example app that is launched within an EMR, meant for providers, and the app is given the current patient and encounter context that the provider is currently in.

Tested to be compatible with both the [Smart Launcher](https://launch.smarthealthit.org) and [Cerner's Sandbox](https://code-console.cerner.com/).

Relevant documentation:
[HL7 App Launch Documentation](https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html)
[Cerner's Older SMART on FHIR App Tutorial](https://engineering.cerner.com/smart-on-fhir-tutorial/)

## Development

```bash
npm install
```

```bash
npm run dev
```

This will start the development server at `http://localhost:5173/`.
