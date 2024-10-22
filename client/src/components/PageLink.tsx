import { useRef, useState } from "react";
import { Page } from "../types/page";
import Modal from "./Modal";

type PageManipulateModalPosition = {
  x: number;
  y: number;
};

export function PageLink(
  props: {
    page: Page;
    currentPage: number;
    handleClick: Function;
    manipulateFiles: Function;
  },
) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [getFileNameModal, setGetFileNameModal] = useState<boolean>(false);
  const { page, currentPage, handleClick, manipulateFiles } = props;
  const [modalPosition, setModalPosition] = useState<
    PageManipulateModalPosition
  >({ x: 0, y: 0 });
  const [fileOperation, setFileOperation] = useState<string>("");
  const fileNameRef = useRef<string>("");
  return (
    <>
      <button
        className={`h-8 leading-8 text-left pl-8 w-full mb-[1px] hover:bg-white ${
          (currentPage == page.id) ? "bg-white" : "bg-gray-200"
        }`}
        onClick={async () => {
          await handleClick(page.id, currentPage);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowModal(true);
          setModalPosition({ x: e.pageX, y: e.pageY });
        }}
      >
        {page.title}
      </button>
      <Modal
        displayModal={showModal}
        x={modalPosition.x}
        y={modalPosition.y}
        closeModal={() => setShowModal(false)}
      >
        <div className="flex flex-col items-start w-52 p-8 px-12 rounded-md bg-gray-100 border-blue-500 border-2">
          <button
            className="py-1"
            onClick={() => {
              setGetFileNameModal(true);
              setShowModal(false);
              setFileOperation("100");
            }}
          >
            Rename
          </button>
          <button
            className="py-1"
            onClick={() => {
              setGetFileNameModal(true);
              setShowModal(false);
              setFileOperation("010");
            }}
          >
            Duplicate
          </button>
          <button
            className="py-1"
            onClick={async () => {
              setShowModal(false);
              console.log(page.id);
              await manipulateFiles("001", "", page.id);
            }}
          >
            Delete
          </button>
        </div>
      </Modal>
      <Modal
        displayModal={getFileNameModal}
        closeModal={() => setGetFileNameModal(false)}
        x={0}
        y={0}
      >
        <div className="flex flex-col items-start w-96 p-4 px-12 rounded-md bg-gray-200 border-blue-500 border-2">
          <label className="pt-8 pb-2">Enter file name</label>
          <input
            type="text"
            id="get_filename"
            className="py-1 outline-none w-full rounded-sm p-1 px-2"
            autoFocus={true}
            onChange={(event) => {
              fileNameRef.current = event.target.value;
            }}
          />
          <button
            className="bg-blue-500 rounded-md my-4 self-center px-4 py-1 text-white hover:bg-blue-700"
            onClick={async () => {
              setGetFileNameModal(false);
              await manipulateFiles(
                fileOperation,
                fileNameRef.current,
                page.id,
              );
            }}
          >
            Submit
          </button>
        </div>
      </Modal>
    </>
  );
}
