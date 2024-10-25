import * as constants from "../constants";
import { Page } from "../types/page";

// function to fetch pages
async function fetchPages(accessToken: string | null): Promise<Array<Page>> {
  if (accessToken === null) return [];
  const accessTokenWithBearer: string = `Bearer ${accessToken}`;
  const response: Response = await fetch(
    `${constants.SERVER_ADDRESS}${constants.GET_USER_PAGES}`,
    {
      method: "GET",
      headers: {
        "Authorization": accessTokenWithBearer,
      },
    },
  );
  if (!response.ok) {
    console.log("error fetching pages");
    return [];
  }
  const data = await response.json();
  let fetchedPages: Page[] = [];
  for (let fetchedPage of data["pages"]) {
    fetchedPages.push(
      new Page(fetchedPage.page_id, fetchedPage.title, fetchedPage.content),
    );
  }
  return fetchedPages;
}

async function savePage(
  accessToken: string | null,
  title: string,
  content: string,
): Promise<any> {
  if (accessToken === null) return null;
  const accessTokenWithBearer: string = `Bearer ${accessToken}`;
  const response: Response = await fetch(
    `${constants.SERVER_ADDRESS}${constants.PAGE_CREATE}`,
    {
      method: "POST",
      headers: {
        "Authorization": accessTokenWithBearer,
      },
      body: JSON.stringify({
        title: title,
        content: content,
      }),
    },
  );
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}

async function updatePageContent(
  accessToken: string | null,
  page_id: number,
  content: string,
): Promise<boolean> {
  if (accessToken === null) return false;
  const accessTokenWithBearer: string = `Bearer ${accessToken}`;
  const response: Response = await fetch(
    `${constants.SERVER_ADDRESS}${constants.PAGE_CONTENT_UPDATE}`,
    {
      method: "POST",
      headers: {
        "Authorization": accessTokenWithBearer,
      },
      body: JSON.stringify({
        page_id: page_id,
        content: content,
      }),
    },
  );
  if (!response.ok) {
    return false;
  }
  return true;
}

async function deletePage(
  accessToken: string | null,
  page_id: number,
): Promise<boolean> {
  if (accessToken === null) return false;
  const accessTokenWithBearer: string = `Bearer ${accessToken}`;
  const response: Response = await fetch(
    `${constants.SERVER_ADDRESS}${constants.PAGE_DELETE}`,
    {
      method: "DELETE",
      headers: {
        "Authorization": accessTokenWithBearer,
      },
      body: JSON.stringify({
        page_id: page_id,
      }),
    },
  );
  if (!response.ok) {
    // return @message "Error deleting page"
    return false;
  }
  return true;
}

async function updatePageTitle(
  accessToken: string | null,
  page_id: number,
  title: string,
): Promise<boolean> {
  if (accessToken === null) return false;
  const accessTokenWithBearer: string = `Bearer ${accessToken}`;
  const response: Response = await fetch(
    `${constants.SERVER_ADDRESS}${constants.PAGE_TITLE_UPDATE}`,
    {
      method: "POST",
      headers: {
        "Authorization": accessTokenWithBearer,
      },
      body: JSON.stringify({
        page_id: page_id,
        title: title,
      }),
    },
  );
  if (!response.ok) {
    // return @message "Error updating title";
    return false;
  }
  return true;
}

async function bulkSavePages(
  accessToken: string,
  pages: Page[],
): Promise<boolean> {
  let response: boolean = true;
  for (let page of pages) {
    console.log(page.id, " => ", page.content);
    const success = await updatePageContent(accessToken, page.id, page.content);
    response = response && success;
  }
  return response;
}

async function performBulkSave(
  accessToken: string | null,
  pages: Page[],
): Promise<boolean> {
  if (accessToken === null) return false;
  const success: boolean = await bulkSavePages(accessToken, pages);
  return success;
}

function fetchCurrentPageContent(pages: Page[], pageId: number): string {
  let content: string = pages.filter((page) => {
    if (page.id === pageId) {
      return page.content;
    }
  })[0]?.content || "";
  return content;
}

export {
  deletePage,
  fetchCurrentPageContent,
  fetchPages,
  performBulkSave,
  savePage,
  updatePageContent,
  updatePageTitle,
};
