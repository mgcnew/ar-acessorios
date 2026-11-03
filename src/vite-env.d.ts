/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "memory" na versão publicada como prévia (sem depender do endereço da página). */
  readonly VITE_ROUTER?: 'browser' | 'memory';
}
