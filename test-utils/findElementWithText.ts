import { screen } from "@testing-library/react";

export const findElementWithText = (text: string) => {
  const elements = screen.getAllByText((content) => content.includes(text));

  if (elements.length === 0) {
    throw new Error(`Unable to find an element with the text: ${text}`);
  }

  return elements[0];
};
