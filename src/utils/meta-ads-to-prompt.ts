import { MetaAdMetricsWithImages } from "../models/MetaAd";

export function generateMetaAdsImageDataPrompt(metaAdsWithImage: MetaAdMetricsWithImages[]): any[] {
  var prompt_images = [];
  for (let metaAd of metaAdsWithImage) {
    for (let image_url of metaAd.image_urls) {
      prompt_images.push({
        type: "image_url",
        image_url: {
          url: image_url,
        },
      });
      if (prompt_images.length >= 40) {
        return prompt_images;
      }
    }
  }
  return prompt_images;
}
