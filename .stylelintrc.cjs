module.exports = {
  extends: [
    'stylelint-config-recommended-vue', // поддержка <style> в .vue (postcss-html)
    'stylelint-config-standard', // базовые правила
    'stylelint-config-tailwindcss', // совместимость с utility-классами
  ],

  overrides: [{ files: ['**/*.vue', '**/*.html'], customSyntax: 'postcss-html' }],

  rules: {
    /** Разрешаем только BEM в kebab: block, block__element, block--modifier */
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$',
      { resolveNestedSelectors: true, message: 'BEM: block__element--modifier (kebab-case).' },
    ],

    /** Vue scoped helpers — не считать неизвестными */
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global'], // :deep(...) и :global(...)
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'], // ::v-deep
      },
    ],

    /** Не спорим за формат токенов/пробелы */
    'color-hex-length': null, // не требуем #fff вместо #ffffff
    'custom-property-empty-line-before': null,
    'color-function-alias-notation': null, // rgba(...) ок
    'color-function-notation': null, // не заставляем rgb() с space/percent
    'alpha-value-notation': null, // 0.15 ок

    /** Уберём «косметические» спам-правила */
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'media-feature-range-notation': null,

    /** Tailwind-friendly */
    'no-descending-specificity': null,
    'declaration-property-value-no-unknown': null, // theme(...) и прочее — ок
  },
}
