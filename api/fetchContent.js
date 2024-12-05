export default async function handler(req, res) {
  try {
    const {
      CONTENTFUL_SPACE_ID,
      CONTENTFUL_ENVIRONMENT,
      CONTENTFUL_ACCESS_TOKEN,
    } = process.env;

    if (
      !CONTENTFUL_SPACE_ID ||
      !CONTENTFUL_ENVIRONMENT ||
      !CONTENTFUL_ACCESS_TOKEN
    ) {
      //   return res.status(500).end();
      // .json({ error: "Environment variables are missing." });
      return;
    }

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries?access_token=${CONTENTFUL_ACCESS_TOKEN}&content_type=fitin&include=2`
    );

    // https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/assets/assetId?access_token=accessToken

    if (!response.ok) {
      //   return res.status(response.status).end();
      // .json({ error: "Failed to fetch data from Contentful" });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}