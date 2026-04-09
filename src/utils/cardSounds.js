// src/utils/cardSounds.js
const globalSoundRegistry = new Map();

export const checkAndRegisterSound = (index) => {
  const now = Date.now();
  const lastPlayed = globalSoundRegistry.get(index);

  // Si este índice intentó sonar hace menos de 500ms, es un eco.
  if (lastPlayed && (now - lastPlayed) < 500) {
    return false;
  }

  // Registramos el tiempo actual
  globalSoundRegistry.set(index, now);
  return true;
};

export const clearCardSounds = () => {
  globalSoundRegistry.clear();
};