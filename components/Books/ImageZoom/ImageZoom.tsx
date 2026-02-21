"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch";

import STYLES from "./ImageZoom.module.scss";

export type MarkdownImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height" | "alt"
> & {
  src?: string | Blob | null;
  alt?: string;
  width?: number | string;
  height?: number | string;
  // react-markdown also passes "node"
  node?: unknown;
};

const Controls = () => {
  const { zoomIn, resetTransform } = useControls();
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  return (
    <div className={STYLES.tools}>
      {!isZoomedIn ? (
        <button
          className={STYLES.control}
          onClick={() => {
            zoomIn(1);
            setIsZoomedIn(true);
          }}
        >
          +
        </button>
      ) : (
        <button
          className={`${STYLES.control} ${STYLES.reset}`}
          onClick={() => {
            resetTransform();
            setIsZoomedIn(false);
          }}
        >
          +
        </button>
      )}
    </div>
  );
};

export const ImageZoom: React.FC<MarkdownImgProps> = ({
  src,
  alt,
  width,
  height,
  ...props
}) => {
  if (typeof src !== "string") return null;

  const updatedSrc = src.replace(/^(\.\.\/)?public(?=\/|$)/, "");

  return (
    <TransformWrapper initialScale={1} wheel={{ disabled: true }}>
      <Controls />
      <TransformComponent>
        <Image
          src={updatedSrc}
          alt={alt ?? ""}
          width={width != null ? Number(width) : 0}
          height={height != null ? Number(height) : 0}
          {...props}
        />
      </TransformComponent>
    </TransformWrapper>
  );
};
