"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useRef, useEffect } from "react";

import STYLES from "./Dialog.module.scss";

type Props = {
  id: string;
  children: ReactNode;
  handleResetFilters?: () => void;
  hasActiveFilters?: boolean;
  isFooterEnabled?: boolean;
  isOpen: boolean;
  onClose: () => void | null;
  title: string;
  totalFiltered?: number;
  total?: number;
};

type DialogProps = {
  isDialogOpen: boolean;
};

// TODO: this check if the browser support the HTML dialog element. We can remove it once we drop support as a business for Safari 14
const dialogSupported = typeof HTMLDialogElement === "function";

const setPageProperties = ({ isDialogOpen }: DialogProps) => {
  document.body.style.overflowY = isDialogOpen ? "hidden" : "visible";

  if (!dialogSupported) {
    document.body.style.position = isDialogOpen ? "fixed" : "relative";
    document.body.style.width = isDialogOpen ? "100%" : "auto";
  }
};

export function Dialog(props: Props) {
  const t = useTranslations("dialog");
  const {
    children,
    id,
    isFooterEnabled,
    isOpen,
    handleResetFilters,
    hasActiveFilters,
    onClose,
    title,
    totalFiltered,
    total,
  } = props;

  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      // There is a bug on older versions of browser using chromium (chrome, firefox, edge >114) where the dialog got an open attribute even before it is opened.
      // Therefore, when trying to open it, it crashes and log an error mentioning the dialog has already an open attribute.
      ref.current?.removeAttribute("open");
      ref.current?.showModal?.();
    } else {
      ref.current?.close?.();
    }

    setPageProperties({ isDialogOpen: isOpen });
    return () => {
      setPageProperties({ isDialogOpen: false });
    };
  }, [isOpen]);

  return (
    <>
      {isOpen ? (
        <div
          className={
            STYLES[`dialog-wrapper ${dialogSupported ? "" : "dialog-polyfill"}`]
          }
        >
          {!dialogSupported && <div id={`${id}-polyfill`} data-open={isOpen} />}
          <dialog
            id={id}
            className={STYLES.dialog}
            onClose={onClose}
            data-open={isOpen}
            ref={ref}
          >
            <div className={STYLES["dialog-header-container"]}>
              <div className={STYLES["dialog-header"]}>
                <h2>{title}</h2>
                <button onClick={onClose} className={STYLES["close-button"]}>
                  {t("done")}
                </button>
              </div>
            </div>
            <div className={STYLES["dialog-container"]}>{children}</div>
            <div className={STYLES["dialog-footer-container"]}>
              {isFooterEnabled && (
                <div className={STYLES["dialog-footer"]}>
                  <button
                    className={STYLES["dialog-cancel-button"]}
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilters}
                  >
                    {t("resetFilters")}
                  </button>
                  <div className={STYLES["total-filters"]}>
                    {totalFiltered}/{total}
                  </div>
                </div>
              )}
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}
