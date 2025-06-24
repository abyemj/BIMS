
// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support.
  isCSSEnabled: true,
});

// Sourced from https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
// and https://docs.expo.dev/guides/customizing-metro/#react-native-svg-transformer
// It is not needed for this project, but it is a common source of confusion.

// // 2. Enable SVG support
// const { transformer, resolver } = config;

// config.transformer = {
//   ...transformer,
//   babelTransformerPath: require.resolve("react-native-svg-transformer"),
// };
// config.resolver = {
//   ...resolver,
//   assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
//   sourceExts: [...resolver.sourceExts, "svg"],
// };

module.exports = config;
