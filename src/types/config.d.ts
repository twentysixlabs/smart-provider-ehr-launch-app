/**
 * Type declaration for JSON config imports
 */

declare module '@/config/config.json' {
  export interface Config {
    CLIENT_ID: string;
    BASE_URL: string;
    SMART_SCOPES: string[];
    STORAGE_KEYS: {
      OAUTH_STATE: string;
      CODE_VERIFIER: string;
      TOKEN_DATA: string;
      AUTHORIZATION_URL: string;
      TOKEN_URL: string;
      FHIR_BASE_URL: string;
    };
    STORAGE_TYPE: 'local' | 'session';
  }

  const config: Config;
  export default config;
}

declare module '@/config/config.epic.prod.json' {
  import type { Config } from '@/config/config.json';
  const config: Config;
  export default config;
}

declare module '@/config/config.cerner.prod.json' {
  import type { Config } from '@/config/config.json';
  const config: Config;
  export default config;
}
