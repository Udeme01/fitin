// fetch multiple entries
export const fetchAllEntries = async () => {
  const response = await fetch("/api/fetchContent");

  if (!response.ok) {
    console.log("all entries", response);
    const errorMessage =
      response.status === 404
        ? "No products found"
        : "Failed to fetch product items";

    throw new Response(JSON.stringify({ message: errorMessage }), {
      status: response.status,
    });
  }

  const data = await response.json();

  // Map the assets from `includes.Asset`
  const assets = data.includes?.Asset || [];

  // Helper function to find an asset by its ID
  const getAssetUrl = (assetId) => {
    const asset = assets.find((asset) => asset.sys.id === assetId);
    return asset?.fields.file.url || "";
  };

  return data.items?.map((item) => ({
    id: item.sys.id, // Extract the ID from `sys`
    image: getAssetUrl(item.fields.fitinImage?.sys.id) || "", // Safely extract the image URL
    description: item.fields.fitinDescription || "", // Default to an empty string if undefined
    title: item.fields.fitinTitle || "Untitled", // Provide a default title if missing
    price: item.fields.fitinPrice || 0, // Default price to 0 if undefined
    colors: item.fields.colors || "",
    sizes: item.fields.sizes || "",
  }));
};

// fetch a single entry
export const fetchEntry = async (entryId) => {
  const response = await fetch(`/api/fetchSingleEntry?entryId=${entryId}`);

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: "Product Page Not Found" }), {
      status: response.status,
    });
  }

  const data = await response.json();

  let imageUrl = "";
  if (data.fields.fitinImage?.sys?.id) {
    // Fetch the linked image asset
    const assetId = data.fields.fitinImage?.sys.id;

    const assetResponse = await fetch(`/api/fetchAsset?assetId=${assetId}`);

    if (assetResponse.ok) {
      const assetData = await assetResponse.json();
      // console.log(assetData);
      imageUrl = assetData.fields.file.url || "";
    }
  }

  // Resolve the gallery image URLs
  let galleryImageUrls = [];
  if (data.fields.galleryImages) {
    // Extract asset IDs
    const galleryImageIds = data.fields.galleryImages.map(
      (image) => image.sys.id
    );

    const fetchGalleryAssets = galleryImageIds.map((assetId) =>
      fetch(`/api/fetchAsset?assetId=${assetId}`)
    );

    // Resolve all promises
    const galleryResponses = await Promise.all(fetchGalleryAssets);

    // Process each response
    galleryImageUrls = await Promise.all(
      galleryResponses.map(async (response) => {
        if (response.ok) {
          const assetData = await response.json();
          return assetData.fields.file.url || ""; // Extract the URL or default to an empty string
        }
        return ""; // Default to empty string if the fetch fails
      })
    );
  }

  return {
    id: data.sys.id,
    title: data.fields.fitinTitle || "Untitled",
    description: data.fields.fitinDescription || "",
    image: imageUrl,
    galleryImages: galleryImageUrls,
    price: data.fields.fitinPrice || 0,
    colors: data.fields.colors || "",
    sizes: data.fields.sizes || "",
  };
};
