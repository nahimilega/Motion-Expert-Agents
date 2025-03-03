# Dara Denny: Uncover winning patterns in your ads  

## Dara Denny Workflow
1. 📊 Fetch active meta ads
2. 🔬Extract winning and loosing patterns
3. 🧩Combine with Dara's market knowledge
4. ✅ Generate what's working, what's not, and recommendations (in json format)
![Dara Denny Workflow](https://fgimagestorage.blob.core.windows.net/images/flowchartofdara.png)

### Sample Output
```
{
  "recommendations": {
    "whats_working": [
      "Personalized Messaging: Ads using personalized headings like 'For the Boyfriends who loves flaunting his shoes' resonate well with specific audience segments, leveraging identity and personal connection.",
      "Direct and Actionable CTAs: Clear CTAs such as 'Shop Now' and 'Starting at just ₹500 Per Month' effectively drive immediate action by reducing decision-making friction.",
      "Visuals and Product Display: Bright yellow backgrounds and clean visuals highlight the product's benefits, making the ads stand out and capture attention."
    ],
    "whats_not_working": [
      "Visual Contrast and Clarity: Split-screen designs and cluttered visuals fail to communicate product benefits effectively, leading to lower engagement.",
      "Messaging and Emotional Engagement: Negative comparisons and lack of emotional storytelling result in weak messaging that doesn't resonate with the audience.",
      "Discount Strategy and Pricing: 'Up to 50% OFF' lacks specificity and can be perceived as misleading, reducing trust in the offer."
    ],
    "recommendations": [
      "Enhance Visual Appeal: Implement single-focus imagery with high color contrast (70:30 ratio of primary to accent colors) to increase CTR by an estimated 15-20%. A/B test lifestyle imagery against product-only shots to identify optimal visual strategy.",
      "Refine Messaging: Develop 3-5 personalized audience segments with tailored messaging that leverages emotional triggers. Data shows personalized ads achieve 29% higher conversion rates and 5x higher CTR than generic alternatives.",
      "Clarify Discounts: Replace 'Up to X% OFF' messaging with transparent fixed discounts. Studies indicate specific offers like 'Flat 30% OFF' drive 27% higher conversion rates than variable discounts, with 68% of consumers citing transparency as a key trust factor.",
      "Implement Social Proof: Add customer testimonials or review scores to ads, as campaigns featuring social proof elements see an average 35% increase in conversion rates and 22% higher engagement metrics."    
    ]
  }
}
```
# 🏗️ Technical Architecture
## Design Consideration
- **🧩 Modular Design:** Each step in the workflow is encapsulated as a separate module (Single Responsibility), allowing for easy extension. Different types of workflows can be created by combining different steps using **🔨Builder Pattern**

```
pipeline.addTask(new FetchMetaAdsWithImage())
.addTask(new IdentifyBrandType())
.addTask(new FindStaticHighPerformingPattern())
.addTask(new FindStaticLowPerformingPattern())
.addTask(new GenerateRecommendations());
pipeline.execute(context)
```
- This is done via **📋Template Method Pattern** with abstract class WorkflowStep and concrete implementations for each step in the pipeline.

```
export abstract class WorkflowStep {
  async validate(context: WorkflowPipelineContext): Promise<void> 
  abstract execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext>;
}
```
```
export class FindStaticHighPerformingPattern extends WorkflowStep {
  outputKey: string = "highPerformingPatterns";

  async execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    const results = await findPatternInHighPerformingStaticAds(context["metaAds"]);

    return {
      ...context,
      [this.outputKey]: results,
    };
  }
}
```
This approach offers several benefits:
- **🔄Decoupling**: Logic is separated from workflow construction
- **♻️Reusability**: Steps can be reused in different workflows
- **🔌Extensibility**: New steps can be added without modifying existing code


### 💻Technical Implementation
- **Stack:** TypeScript, Node.js
- **Integration:** Meta API, OpenAI API

## Project Structure
**🔀 Separation of Concerns:** Clear boundaries and decoupling between data access, intelligence, models, and workflow steps
```
src/
├── api/                 # External API integrations 
│   ├── genai/           # OpenAI API client for AI analysis
│   ├── meta/            # Meta API client for ad data fetching
├── data/                # Data access and transformation
│   ├── market-trends/   # Market knowledge (creator expertise)
│   ├── meta/            # Meta platform data services
├── intelligence/        # Core AI analysis capabilities
│   ├── pattern-identification/ # Identify high/low performing patterns
│   ├── recommendation/  # Generate actionable recommendations
├── models/              # Data models and type definitions
├── utils/               # Shared utility functions
├── workflows/           # Pipeline implementation
│   ├── steps/           # Individual workflow steps decoupled from logic
```

## 🛡️Error Handling
- **Axios interceptors** for centralized request/response error processing
- **Exponential backoff with jitter** for optimal retry distribution
- **Graceful pagination failure** with partial results and detailed statistics for Meta API
- **Function result validation** with specialized error handling for tool calls for OpenAI API


## Assumptions & Limitations

### Core Assumptions
- Revenue is the primary optimization metric
- Analysis is limited to image-based ads only (for MVP simplicity)
- Facebook User Token and Account ID are provided as input and are valid

### Technical Considerations
- Minimum threshold of 5 ads required for pattern analysis
- Temporary URLs from Facebook API are acceptable
- In-memory storage is used instead of persistent database (for easier setup)

### Data Handling
- Creatives with failed image fetching are excluded from analysis to maintain data quality
- Pattern analysis focuses on trend identification rather than individual ad performance, hence discarding few unfetched ads is acceptable

