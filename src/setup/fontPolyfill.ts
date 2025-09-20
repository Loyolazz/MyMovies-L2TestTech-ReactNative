import ExpoFontLoader from 'expo-font/build/ExpoFontLoader';

const loader = ExpoFontLoader as unknown as {
  getLoadedFonts?: () => string[];
  isLoaded?: (fontFamily: string) => boolean;
};

if (typeof loader.getLoadedFonts !== 'function') {
  loader.getLoadedFonts = () => [];
}

if (typeof loader.isLoaded !== 'function') {
  loader.isLoaded = () => false;
}
