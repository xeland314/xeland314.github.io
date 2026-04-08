import { themes, type Language } from "prism-react-renderer";

export const THEMES = {
  vsDark: themes.vsDark,
  vsLight: themes.vsLight,
  dracula: themes.dracula,
  nightOwl: themes.nightOwl,
  nightOwlLight: themes.nightOwlLight,
  shadesOfPurple: themes.shadesOfPurple,
  oceanicNext: themes.oceanicNext,
  github: themes.github,
  palenight: themes.palenight,
  ultramin: themes.ultramin,
  duotoneDark: themes.duotoneDark,
  duotoneLight: themes.duotoneLight,
  jettwaveDark: themes.jettwaveDark,
  okaidia: themes.okaidia,
};

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "markup", label: "Markup" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "objectivec", label: "Objective-C" },
  { value: "js-extras", label: "JS Extras" },
  { value: "reason", label: "Reason" },
  { value: "rust", label: "Rust" },
  { value: "graphql", label: "GraphQL" },
  { value: "yaml", label: "YAML" },
  { value: "go", label: "Go" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "markdown", label: "Markdown" },
  { value: "python", label: "Python" },
  { value: "json", label: "JSON" },
].sort((a, b) => a.label.localeCompare(b.label, "es"));
