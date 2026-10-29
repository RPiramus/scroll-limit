const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro's asset list is case-sensitive and only knows lowercase "mp4".
// This lets the videos keep their uppercase .MP4 names.
for (const ext of ['MP4', 'MOV']) {
  if (!config.resolver.assetExts.includes(ext)) config.resolver.assetExts.push(ext);
}

module.exports = config;
