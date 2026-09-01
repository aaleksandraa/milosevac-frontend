/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_BACKEND_PUBLIC_URL?: string;
  readonly VITE_BACKEND_STORAGE_PATH?: string;
  readonly VITE_ATLAS_MAP_STYLE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
