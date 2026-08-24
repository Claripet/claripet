import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      'node_modules/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // eslint-plugin-react-hooks v7 flags every synchronous setState in an
      // effect. Our remaining hits are all client-only work that cannot happen
      // during render: localStorage hydration, `mounted` guards, fetch-on-mount
      // loaders, IntersectionObserver visibility and route-change resets.
      // Kept as a warning so new occurrences stay visible without failing lint.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
