/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_BACKEND_PUBLIC_URL?: string;
  readonly VITE_BACKEND_STORAGE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
