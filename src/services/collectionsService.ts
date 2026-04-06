import type { BookmarkCollections } from "@/db/schema";

export async function createCollection(data: {
  name: string;
  description?: string;
}): Promise<{ id: string; name: string; description: string } | null> {
  try {
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to create collection", error);
    return null;
  }
}

export async function updateCollection(
  id: string,
  data: { name: string; description: string },
): Promise<boolean> {
  try {
    const response = await fetch(`/api/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to update collection", error);
    return false;
  }
}

export async function deleteCollection(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/collections/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete collection", error);
    return false;
  }
}

export async function getBookmarkCollections(
  bookmarkId: string,
): Promise<BookmarkCollections[]> {
  try {
    const response = await fetch("/api/bookmark-collections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookmarkId }),
    });
    return response.json();
  } catch (error) {
    console.error("Failed to add bookmark", error);
    return [];
  }
}

// move to collection-bookmarks service
export async function addBookmarkToCollection({
  collectionId,
  bookmarkId,
}: {
  collectionId: string;
  bookmarkId: string;
}) {
  try {
    const response = await fetch("/api/collections/bookmark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collectionId,
        bookmarkId,
      }),
    });
    return response.json();
  } catch (error) {
    console.error("Failed to add bookmark to collection", error);
    return [];
  }
}

export async function removeBookmarkFromCollection({
  collectionId,
  bookmarkId,
}: {
  collectionId: string;
  bookmarkId: string;
}) {
  try {
    const response = await fetch("/api/collections/bookmark", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collectionId,
        bookmarkId,
      }),
    });

    return response.json();
  } catch (error) {
    console.error("Failed to remove bookmark from collection", error);
    throw error;
  }
}
