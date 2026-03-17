import { render, screen } from "@testing-library/react";

import { DiaryHometown } from "@/components/Profile/ProfileDiary/DiaryHometown/DiaryHometown";

const component = <DiaryHometown residence="Wellington" />;

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

test("renders residence when known", () => {
  render(component);

  expect(screen.getByText("Residence")).toBeInTheDocument();
  expect(screen.getByText("Town")).toBeInTheDocument();
  expect(screen.getByText("Wellington")).toBeInTheDocument();
});

test("does not render residence when unknown", () => {
  const { container } = render(<DiaryHometown residence={null} />);

  expect(container).toBeEmptyDOMElement();
});
