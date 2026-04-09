export async function addBookmark(
  translationId: string,
): Promise<string | null> {
  try {
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ translationId }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return (data.added?.[0]?.id as string) ?? null;
  } catch (error) {
    console.error("Failed to add bookmark", error);
    return null;
  }
}

export async function removeBookmark(translationId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ translationId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete bookmark", error);
    return false;
  }
}
