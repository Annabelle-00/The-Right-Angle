import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function getRecommendations(rom, strength) {
  const recommendations = [
    `Based on ROM (${rom}°) and Strength (${strength} pounds):`
  ];

  // ROM recommendation
  if (rom >= 160) {
    recommendations.push("Excellent ROM! Maintain current flexibility routine.");
  } else if (rom >= 130) {
    recommendations.push("Good ROM — consider gentle stretching exercises daily.");
  } else {
    recommendations.push("Limited ROM — focus on active-assisted ROM exercises twice daily.");
  }

  // Strength recommendation
  if (strength >= 80) {
    recommendations.push("Strength is excellent — continue current strengthening program.");
  } else if (strength >= 50) {
    recommendations.push("Moderate strength — add isometric strengthening: 10-sec holds, 10 reps.");
  } else {
    recommendations.push("Low strength — begin with light resistance and high-rep exercises.");
  }

  // Universal tip
  recommendations.push("Consider applying a heat pack before exercises to improve mobility.");

  return recommendations;
}
