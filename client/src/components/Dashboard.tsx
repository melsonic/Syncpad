import { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
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
  fetchCurrentPageContent,
  fetchPages,
  performBulkSave,
  savePage,
  updatePageTitle,
} from "../util/dashboard_utils.ts";

export function Dashboard() {
  const [user, setUser] = useAtom(userLoggedInAtom);
  const editor = useRef<EditorView | null>(null);
  const currentPageContent = useRef<string>("");
  const pageRef = useRef<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(-1);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();

  async function createNewPage(title: string, content: string) {
    const data: any = await savePage(accessToken, title, content);
    if (data === null) return;
    pageRef.current = [
      ...pageRef.current,
      new Page(data["page_id"], data["title"], data["content"]),
    ];
    setCurrentPage(data["page_id"]);
  }

  function updateCurrentPageContent(currentPageId: number) {
    pageRef.current = pageRef.current.map((page) => {
      if (page.id === currentPageId) {
        page.content = currentPageContent.current;
      }
      return page;
    });
  }

  function handlePageLinkClick(
    clickedPageId: number,
  ) {
    if (clickedPageId === currentPage) return;
    updateCurrentPageContent(currentPage);
    setCurrentPage(clickedPageId);
    currentPageContent.current = fetchCurrentPageContent(
      pageRef.current,
      clickedPageId,
    );
  }

  async function manipulatePages(
    flags: string,
    pageName: string = "",
    pageId: number,
  ) {
    if (flags === "010") { // duplicate file
      if (pageName === "") return;
      const pageContent = pageRef.current.filter((page) =>
        page.id == pageId
      )[0].content;
      await createNewPage(pageName, pageContent);
    } else if (flags === "001") { // delete file
      const done: boolean = await deletePage(accessToken, pageId);
      if (!done) return;
      pageRef.current = pageRef.current.filter((page) => page.id != pageId);
    } else if (flags === "100") { // rename file
      if (pageName === "") return;
      const done: boolean = await updatePageTitle(
        accessToken,
        pageId,
        pageName,
      );
      if (!done) return;
      pageRef.current = pageRef.current.map((page) => {
        if (page.id === pageId) {
          page.title = pageName;
        }
        return page;
      });
    }
  }

  async function beforeUnloadHandler(e: Event) {
    e.preventDefault();
    const success = await autoSavePages();
    console.log(success);
    return "";
  }

  async function autoSavePages(): Promise<boolean> {
    updateCurrentPageContent(currentPage);
    const success = await performBulkSave(accessToken, pageRef.current);
    if (success) {
      console.log("pages saved successfully!!!");
    } else {
      console.log("pages not saved correctly!!!");
    }
    return success;
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
      pageRef.current = [...fetchedPages];
      if (fetchedPages.length > 0) {
        setCurrentPage(fetchedPages[0].id);
      }
    }
    fetchPagesUtil();
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
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.docChanged) {
          currentPageContent.current = v.state.doc.toString();
        }
      }),
    ];

    let startState = EditorState.create({
      extensions: extensions,
      doc: "Welcome to Syncpad!!!",
    });

    let view = new EditorView({
      state: startState,
      parent: editorElement,
    });

    editor.current = view;

    window.addEventListener("beforeunload", beforeUnloadHandler);

    return () => {
      view.destroy();
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  useEffect(() => {
    editor.current?.dispatch({
      changes: {
        from: 0,
        to: editor.current?.state.doc.length,
        insert: fetchCurrentPageContent(pageRef.current, currentPage),
      },
    });
  }, [currentPage]);

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
        {pageRef.current.map((page) => (
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
