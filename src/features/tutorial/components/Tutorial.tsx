import { ExternalLink, CheckCircle } from "lucide-react";

export function Tutorial() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              SMART on FHIR Provider EHR Launch App
            </h1>

            <p className="text-lg text-gray-700 mb-8">
              A modern React implementation demonstrating the EHR launch flow
              for provider-facing clinical applications. This app seamlessly
              integrates with Electronic Health Record (EHR) systems, allowing
              you to use it as a template to build and deploy applications for
              providers that they can use within the EMR.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">EHR Launch</h3>
                  <p className="text-sm text-gray-600">
                    Direct access from EHR workflow
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Clinical Context
                  </h3>
                  <p className="text-sm text-gray-600">
                    Pulls relevant patient & encounter info
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    OAuth 2.0 + PKCE
                  </h3>
                  <p className="text-sm text-gray-600">
                    Secure authentication flow
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              Getting Started with SMART App Launcher
            </h2>

            <div className="space-y-6">
              <p>
                You're seeing this tutorial page because you accessed the app
                directly through a browser. To experience the full
                functionality, please launch the app via a SMART App Launcher or
                EMR sandbox. Follow these steps:
              </p>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Step 1: Access the SMART App Launcher
                </h3>
                <p className="text-gray-700 mb-3">
                  Go to the SMART App Launcher to test this application:
                </p>
                <a
                  href="https://launch.smarthealthit.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  https://launch.smarthealthit.org
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Step 2: Configure the Launcher
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">
                      Launch Type:
                    </span>
                    <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-sm">
                      Provider EHR Launch
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      FHIR Version:
                    </span>
                    <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-sm">
                      R4
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      App's Launch URL:
                    </span>
                    <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-sm">
                      http://localhost:5173/auth/smart/login
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Step 3: Select Patient and Practitioner
                </h3>
                <p className="text-gray-700">
                  Choose a sample patient and practitioner from the dropdown
                  menus in the launcher. This simulates the EHR providing
                  clinical context to the app.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Step 4: Launch the App
                </h3>
                <p className="text-gray-700">
                  Click the "Launch" button. The app will receive the launch
                  parameters and guide you through the OAuth flow. Once
                  authenticated, you'll be redirected to the patient data page.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Configuration
            </h2>
            <p className="mb-6">
              If you are launching from the SMART App Launcher, you do not need
              to adjust the configuration.
            </p>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Edit Configuration
              </h3>
              <p className="text-gray-700 mb-3">
                To configure your app, edit{" "}
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                  src/environment/config.json
                </code>
                :
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`{
  "CLIENT_ID": "<YOUR_CLIENT_ID>",
  "BASE_URL": "http://localhost:5173",
  "SMART_SCOPES": [
    "launch",
    "fhirUser",
    "profile",
    "openid",
    "patient/*.rs",
    "user/*.rs",
    "online_access"
  ]
}`}
              </pre>
              <p className="text-sm text-gray-500 mt-2">
                Other examples of configuration can be found in{" "}
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                  src/environment
                </code>
                .
              </p>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Additional Resources
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Testing with Other Environments
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://code-console.cerner.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      Cerner's Code Console Sandbox
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://fhir.epic.com/Documentation?docId=launching"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      Epic's SMART on FHIR Sandbox
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <span className="text-sm text-gray-600 ml-2">
                      (Login required)
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Documentation
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      HL7 SMART App Launch - Official Specification
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://engineering.cerner.com/smart-on-fhir-tutorial/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      Cerner's SMART on FHIR Tutorial
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
