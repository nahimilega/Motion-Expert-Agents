interface CreatorKnowledgeData {
  name: string;
  brandType: string;
  content: string;
}

/**
 * In-memory database of creator data
 */
const creatorDatabase: CreatorKnowledgeData[] = [
  {
    name: "dara_denney",
    brandType: "beauty",
    content: `Leverage User-Generated Content (UGC): Authentic content from real users can significantly boost engagement and trust. In her Performance Creative Master Course, Dara emphasizes the importance of integrating UGC strategies that resonate with audiences
Sustainability and Eco-Friendly Practices: Consumers are prioritizing eco-conscious products, leading brands to develop waterless beauty items, sustainable packaging, and environmentally friendly formulations`,
  },
  {
    name: "dara_denney",
    brandType: "shoes",
    content: `Press Screenshots: Highlighting media coverage or endorsements can enhance credibility and attract attention.
Founder's Story: Sharing the brand's origin story or the founder's journey can create an emotional connection with the audience.
Statistics Ads: Presenting compelling data or statistics about the product's benefits can appeal to analytical customers.
    `,
  },
  {
    name: "alex_wong",
    brandType: "fitness",
    content: `Workout Demonstrations: Show exercises with proper form and technique.
Before & After Transformations: Real progress stories boost credibility.
Challenges & Routines: 30-day fitness challenges increase engagement.
Behind-the-Scenes: Show product creation, athlete partnerships, or team workouts.`,
  },
];

/**
 * Fetches creator text data based on creator name and brand type
 *
 * @param creatorName - The name of the content creator
 * @param brandType - The type of brand/content
 * @returns Promise that resolves to the creator's content or error message
 */
export function fetchCreatorData(creatorName: string, brandType: string): string | undefined {
  const result = creatorDatabase.find((creator) => creator.name.toLowerCase() === creatorName.toLowerCase() && creator.brandType.toLowerCase() === brandType.toLowerCase());
  if (result) {
    return result.content;
  }
}
