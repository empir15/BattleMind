const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Résout l'alias @shared/* vers le dossier shared/ à la racine du projet
    extraNodeModules: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  watchFolders: [
    // Surveille le dossier shared/ pour le hot-reload
    path.resolve(__dirname, 'shared'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

