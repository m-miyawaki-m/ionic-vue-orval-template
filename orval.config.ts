import { defineConfig } from 'orval'

export default defineConfig({
  items: {
    input: {
      target: './openapi/openapi.yaml',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/endpoints.ts',
      schemas: './src/api/generated/model',
      client: 'vue-query',
      mock: true,
      baseUrl: '/api',
      override: {
        mutator: {
          path: './src/api/mutator.ts',
          name: 'customFetch',
        },
      },
    },
  },
})
