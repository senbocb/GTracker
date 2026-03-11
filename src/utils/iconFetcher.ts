"use client";

/**
 * Extracts the domain from a URL and returns a high-res favicon URL.
 */
export const getIconFromUrl = (url: string): string => {
  try {
    if (!url) return "";
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(cleanUrl).hostname;
    // Using Google's high-res favicon service (sz=128 for better quality)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
};

export const SOCIAL_PRESETS = [
  { name: 'Twitter', url: 'twitter.com', icon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=128' },
  { name: 'Discord', url: 'discord.com', icon: 'https://www.google.com/s2/favicons?domain=discord.com&sz=128' },
  { name: 'Twitch', url: 'twitch.tv', icon: 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=128' },
  { name: 'Steam', url: 'steamcommunity.com', icon: 'https://www.google.com/s2/favicons?domain=steamcommunity.com&sz=128' },
  { name: 'Tracker.gg', url: 'tracker.gg', icon: 'https://www.google.com/s2/favicons?domain=tracker.gg&sz=128' },
  { name: 'Faceit', url: 'faceit.com', icon: 'https://www.google.com/s2/favicons?domain=faceit.com&sz=128' },
  { name: 'YouTube', url: 'youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128' },
];