import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ImageZoom } from "@/components/Books/ImageZoom/ImageZoom";

jest.mock("react-zoom-pan-pinch", () => ({
  TransformWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TransformComponent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useControls: () => ({
    zoomIn: jest.fn(),
    resetTransform: jest.fn(),
  }),
}));

describe("ImageZoom", () => {
  test("renders the image with correct src and alt", () => {
    render(<ImageZoom src="public/images/photo.jpg" alt="A tunnel" />);

    const img = screen.getByRole("img", { name: "A tunnel" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/photo.jpg");
  });

  test("strips the leading ../public prefix from src", () => {
    render(<ImageZoom src="../public/images/test.png" alt="test" />);

    expect(screen.getByRole("img")).toHaveAttribute("src", "/images/test.png");
  });

  test("renders nothing when src is not a string", () => {
    const { container } = render(<ImageZoom src={null} alt="missing" />);

    expect(container).toBeEmptyDOMElement();
  });

  test("shows the zoom-in button initially", () => {
    render(<ImageZoom src="/images/photo.jpg" alt="photo" />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("toggles to reset button after clicking zoom in", () => {
    const zoomIn = jest.fn();
    const resetTransform = jest.fn();

    jest.requireMock("react-zoom-pan-pinch").useControls = () => ({
      zoomIn,
      resetTransform,
    });

    render(<ImageZoom src="/images/photo.jpg" alt="photo" />);

    fireEvent.click(screen.getByRole("button"));

    expect(zoomIn).toHaveBeenCalledWith(1);
  });

  test("calls resetTransform when clicking reset button after zooming in", () => {
    const zoomIn = jest.fn();
    const resetTransform = jest.fn();

    jest.requireMock("react-zoom-pan-pinch").useControls = () => ({
      zoomIn,
      resetTransform,
    });

    render(<ImageZoom src="/images/photo.jpg" alt="photo" />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));

    expect(resetTransform).toHaveBeenCalled();
  });
});
