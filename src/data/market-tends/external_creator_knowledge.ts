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
    name: "darray_derry",
    brandType: "beauty",
    content: "Lifestyle tips for modern minimalists.",
  },
  {
    name: "jane_smith",
    brandType: "tech",
    content: "Latest updates on emerging technologies.",
  },
  {
    name: "alex_wong",
    brandType: "fitness",
    content: "Daily workout routines for busy professionals.",
  },
  {
    name: "emma_garcia",
    brandType: "food",
    content: "Simple, nutritious recipes for health-conscious foodies.",
  },
  {
    name: "emma_garcia",
    brandType: "travel",
    content: "Budget-friendly travel guides to exotic destinations.",
  },
];

/**
 * Fetches creator text data based on creator name and brand type
 *
 * @param creatorName - The name of the content creator
 * @param brandType - The type of brand/content
 * @returns Promise that resolves to the creator's content or error message
 */
function fetchCreatorData(creatorName: string, brandType: string): string | undefined {
  const result = creatorDatabase.find((creator) => creator.name.toLowerCase() === creatorName.toLowerCase() && creator.brandType.toLowerCase() === brandType.toLowerCase());
  if (result) {
    return result.content;
  }
}

/**
 * Example usage
 */
async function example() {
  try {
    // Example 1: Fetch existing data
    const techContent = await fetchCreatorData("jane_smith", "tech");
    console.log("Tech content:", techContent);

    // Example 2: Fetch from creator with multiple brand types
    const foodContent = await fetchCreatorData("emma_garcia", "food");
    console.log("Food content:", foodContent);

    // Example 3: Fetch non-existent data
    const nonExistentContent = await fetchCreatorData("john_doe", "music");
    console.log("Non-existent content:", nonExistentContent);
  } catch (error) {
    console.error("Error fetching creator data:", error);
  }
}

// Run the example
example();

// Export the function for use in other modules
export { fetchCreatorData };
