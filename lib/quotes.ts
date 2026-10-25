/** Motivational quotes collection for StudyOS students.
 * Rotates steadily once per day (or 12-hour cycle) using a deterministic date hash
 * so quotes do not flutter or change unexpectedly during study sessions. */

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  role: string;
  category: "focus" | "resilience" | "curiosity" | "consistency";
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: "q-kalam-1",
    quote: "Dream is not that which you see while sleeping, it is something that does not let you sleep.",
    author: "Dr. A.P.J. Abdul Kalam",
    role: "Scientist & 11th President of India",
    category: "focus",
  },
  {
    id: "q-vivekananda-1",
    quote: "Arise, awake, and stop not till the goal is reached.",
    author: "Swami Vivekananda",
    role: "Philosopher & Youth Icon",
    category: "resilience",
  },
  {
    id: "q-einstein-1",
    quote: "It's not that I'm so smart, it's just that I stay with problems longer.",
    author: "Albert Einstein",
    role: "Theoretical Physicist",
    category: "resilience",
  },
  {
    id: "q-ramanujan-1",
    quote: "An equation for me has no meaning unless it expresses a thought of God.",
    author: "Srinivasa Ramanujan",
    role: "Legendary Mathematician",
    category: "curiosity",
  },
  {
    id: "q-kalam-2",
    quote: "If you want to shine like a sun, first burn like a sun.",
    author: "Dr. A.P.J. Abdul Kalam",
    role: "Missile Man of India",
    category: "consistency",
  },
  {
    id: "q-curie-1",
    quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie",
    role: "Pioneer in Radioactivity & Nobel Laureate",
    category: "curiosity",
  },
  {
    id: "q-tagore-1",
    quote: "You cannot cross the sea merely by standing and staring at the water.",
    author: "Rabindranath Tagore",
    role: "Poet & Nobel Laureate",
    category: "focus",
  },
  {
    id: "q-parth-1",
    quote: "It's always YOU vs YOU. And one of you has to die. So, choose wisely.",
    author: "Parth Veer Dubey",
    role: "Developer of the Website",
    category: "focus",
  },
  {
    id: "q-bhabha-1",
    quote: "Each person can do best and excel in that sphere of activity for which they are by nature suited.",
    author: "Dr. Homi J. Bhabha",
    role: "Father of Indian Nuclear Programme",
    category: "consistency",
  },
  {
    id: "q-mandela-1",
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    role: "Statesman & Civil Rights Leader",
    category: "resilience",
  },
  {
    id: "q-confucius-1",
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    role: "Philosopher",
    category: "consistency",
  },
  {
    id: "q-edison-1",
    quote: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.",
    author: "Thomas A. Edison",
    role: "Inventor",
    category: "resilience",
  },
  {
    id: "q-socrates-1",
    quote: "Education is the kindling of a flame, not the filling of a vessel.",
    author: "Socrates",
    role: "Classical Greek Philosopher",
    category: "curiosity",
  },
  {
    id: "q-sarabhai-1",
    quote: "He who can listen to music in the midst of noise can achieve the internal harmony of the mind.",
    author: "Dr. Vikram Sarabhai",
    role: "Father of Indian Space Programme",
    category: "focus",
  },
];

/** Returns the daily motivational quote.
 * Updates steadily once every 12 hours based on system date. */
export function getDailyQuote(): MotivationalQuote {
  const now = new Date();
  // 12-hour slot index (2 changes per day maximum)
  const slot = Math.floor(now.getTime() / (1000 * 60 * 60 * 12));
  const index = Math.abs(slot) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
