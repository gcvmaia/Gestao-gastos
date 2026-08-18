import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Este app não usa uma lib de data-fetching (SWR/React Query) — o
      // padrão "fetch no mount / quando dependências mudam" via useEffect é
      // usado deliberadamente em várias telas/modais e funciona
      // corretamente (verificado manualmente). A regra é nova e bastante
      // estrita nesse padrão comum; mantida como aviso, não erro bloqueante.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
