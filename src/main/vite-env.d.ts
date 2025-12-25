/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SECRET_CODE: string
  readonly VITE_SESSION_KEY: string
  // add other env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
