import globals from "globals";

const sharedGlobals = {
  ...globals.browser,
  // CDN libraries referenced in website-building skill files
  Chart: "readonly", d3: "readonly", gsap: "readonly", ScrollTrigger: "readonly",
  THREE: "readonly", Motion: "readonly", Lenis: "readonly",
  React: "readonly", ReactDOM: "readonly", Vue: "readonly",
  Phaser: "readonly", PIXI: "readonly", p5: "readonly", Kaboom: "readonly",
  L: "readonly", mapboxgl: "readonly",
  anime: "readonly", Tone: "readonly", lottie: "readonly",
  lucide: "readonly", SVG: "readonly", Snap: "readonly",
  CANNON: "readonly", RAPIER: "readonly",
  $: "readonly", jQuery: "readonly",
};

export default [
  { ignores: ["eslint.config.mjs"] },
  {
    files: ["tests/e2e/**/*.js", "playwright.config.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-empty": "error",
      "valid-typeof": "error",
      "no-redeclare": "error",
    },
  },
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-empty": "error",
      "valid-typeof": "error",
      "no-redeclare": "error",
    },
  },
  {
    files: ["supabase-client.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...sharedGlobals,
        state: "writable",
        renderAnalytics: "readonly",
        renderContradictions: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-empty": "error",
      "valid-typeof": "error",
      "no-redeclare": "error",
    },
  },
  {
  ignores: ["js/**/*.js", "tests/e2e/**/*.js", "playwright.config.js", "supabase-client.js"],
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: "script",
    globals: sharedGlobals,
  },
  rules: {
    "no-undef": "error",
    "no-dupe-keys": "error",
    "no-dupe-args": "error",
    "no-duplicate-case": "error",
    "no-unreachable": "error",
    "no-constant-condition": "error",
    "no-empty": "error",
    "valid-typeof": "error",
    "no-redeclare": "error",
  }
}];
