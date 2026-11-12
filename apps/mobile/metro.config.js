const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const existing = config.resolver.blockList;
const inherited = Array.isArray(existing) ? existing : existing ? [existing] : [];

// Native builds create/remove temporary CMake directories while Metro watches
// the workspace. Watching them can crash Metro's Windows fallback watcher.
config.resolver.blockList = [
  ...inherited,
  /[\\/]\.cxx(?:[\\/]|$)/,
  /[\\/]\.gradle(?:[\\/]|$)/,
];

module.exports = config;
