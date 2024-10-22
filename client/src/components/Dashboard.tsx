import { useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownKeymap } from "@codemirror/lang-markdown";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { Page } from "../types/page.tsx";
import { PageLink } from "./PageLink.tsx";
import { userLoggedInAtom } from "../atoms/user.ts";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  deletePage,
  fetchPages,
  performBulkSave,
  savePage,
  updatePageTitle,
} from "../util/dashboard_utils.ts";

export function Dashboard() {
  const [user, setUser] = useAtom(userLoggedInAtom);
  const [editor, setEditor] = useState<EditorView | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);

  async function createNewPage(title: string, content: string) {
    const data: any = await savePage(accessToken, title, content);
    if (data === null) return;
    setPages(
      [...pages, new Page(data["page_id"], data["title"], data["content"])],
    );
  }

  function updateCurrentPageContent(currentPageId: number) {
    setPages(pages.map((page) => {
      if (page.id == currentPageId) {
        page.content = editor?.state.doc.toString() || "";
        console.log(currentPageId, " ", page.content);
      }
      return page;
    }));
  }

  async function handlePageLinkClick(
    clickedPageId: number,
    currentPageId: number,
  ) {
    if (clickedPageId === currentPageId) return;
    updateCurrentPageContent(currentPageId);
    console.log(currentPageId, " -> ", clickedPageId);
    setCurrentPage(clickedPageId);
    /// TODO: if returns false, show in the UI
    // await updatePageContent(accessToken, clickedPageId, contentToUpdate);
  }

  async function manipulatePages(
    flags: string,
    pageName: string = "",
    pageId: number,
  ) {
    if (flags === "010") { // duplicate file
      if (pageName === "") return;
      const pageContent = pages.filter((page) => page.id == pageId)[0].content;
      await createNewPage(pageName, pageContent);
    } else if (flags === "001") { // delete file
      const done: boolean = await deletePage(accessToken, pageId);
      if (!done) return;
      setPages(pages.filter((page) => page.id != pageId));
    } else if (flags === "100") { // rename file
      if (pageName === "") return;
      const done: boolean = await updatePageTitle(
        accessToken,
        pageId,
        pageName,
      );
      if (!done) return;
      setPages(pages.map((page) => {
        if (page.id === pageId) {
          page.title = pageName;
        }
        return page;
      }));
    }
  }

  async function autoSavePages() {
    updateCurrentPageContent(currentPage);
    const response = await performBulkSave(accessToken, pages);
    console.log(response);
  }

  useEffect(() => {
    setAccessToken(window.localStorage.getItem("access-token"));
    if (accessToken !== null) {
      setUser(true);
    }
    if (!user) {
      navigate("/");
      return;
    }
    async function fetchPagesUtil() {
      const fetchedPages: Page[] = await fetchPages(accessToken);
      setPages(fetchedPages);
    }
    fetchPagesUtil();
    if (pages.length > 0) {
      setCurrentPage(pages[0].id);
    }
    const setIntervalId = setInterval(async () => {
      console.log("inside interval : ", currentPage);
      await autoSavePages();
    }, 30000);

    return () => {
      clearInterval(setIntervalId);
    };
  }, [accessToken]);

  useEffect(() => {
    const editorElement: HTMLElement | null = document.getElementById(
      "codemirror_editor",
    );
    if (editorElement == null) {
      return;
    }
    const extensions = [
      markdown(),
      history(),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap, ...markdownKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
    ];

    let startState = EditorState.create({
      extensions: extensions,
      doc: pages.filter((page) => page.id == currentPage)[0]?.content,
    });
    let view = new EditorView({
      state: startState,
      parent: editorElement,
    });

    setEditor(view);

    return () => {
      view.destroy();
      setEditor(null);
    };
  }, [user, currentPage]);

  return (
    <div className="w-screen h-screen flex">
      <div className="w-96 bg-gray-100">
        <div className="w-full h-10 leading-10 font-bold bg-gray-500 px-8 text-xl text-white flex justify-between items-center">
          <span>WORKSPACE</span>
          <span
            className="cursor-pointer h-6 w-6 rounded-sm hover:bg-gray-400 flex justify-center items-center"
            onClick={() => createNewPage("Untitled", "")}
          >
            +
          </span>
        </div>
        {pages.map((page) => (
          <PageLink
            key={page.id}
            page={page}
            currentPage={currentPage}
            handleClick={handlePageLinkClick}
            manipulateFiles={manipulatePages}
          />
        ))}
      </div>
      <div
        id="codemirror_editor"
        className="w-full px-8 py-2 h-full overflow-x-hidden overflow-y-scroll text-xl"
      >
      </div>
    </div>
  );
}
