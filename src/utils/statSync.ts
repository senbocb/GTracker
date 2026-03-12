"use client";

import { showSuccess, showError } from "./toast";

/**
 * Simulates fetching data from an external tracker URL.
 * In a real app, this would call a proxy or use a scraping service.
 */
export const syncTrackerData = async (gameId: string, url: string) => {
  return new Promise((resolve) => {
    // Simulate network latency
    setTimeout(() => {
      const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
      const gameIndex = savedGames.findIndex((g: any) => g.id === gameId);

      if (gameIndex === -1) {
        showError("Linked operation not found.");
        resolve(false);
        return;
      }

      // Simulation logic: Randomly "detect" a rank update based on the URL
      const game = savedGames[gameIndex];
      const mode = game.modes[0]; // Syncing primary mode
      
      // Mocking a rank increase for the demo
      const currentRank = mode.rank;
      showSuccess(`Intel synced from ${new URL(url).hostname}`);
      
      resolve(true);
    }, 1500);
  });
};