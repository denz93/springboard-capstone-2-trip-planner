"use client";

import { useRef } from "react";

export default function Modal({
  children,
  activator,
  action,
  isShowModal = false,
}: {
  children?: React.ReactNode;
  activator?: React.ReactNode;
  action?: React.ReactNode;
  isShowModal?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <div
        onClick={() =>
          isShowModal
            ? dialogRef.current?.showModal({})
            : dialogRef.current?.show()
        }
      >
        {activator}
      </div>
      <dialog ref={dialogRef} className="modal" autoFocus={false}>
        <div
          className="modal-box max-w-none w-10/12 shadow-lg"
          autoFocus={false}
        >
          {children}
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              {action}
            </form>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop  bg-black/50  backdrop-blur-md"
        >
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
