import { render, screen, fireEvent } from "@testing-library/react";

import { RollFilter } from "@/components/Roll/RollFilter/RollFilter";

const defaultProps = {
  className: "test-class",
  uniqueDetachments: [
    { id: 1, label: "Main Body" },
    { id: 2, label: "1st Reinforcements" },
  ],
  uniqueCorps: [
    { id: null, label: "Tunnelling Corps" },
    { id: 5, label: "Engineers" },
  ],
  uniqueMaritalStatuses: [
    { id: 1, label: "Single" },
    { id: 2, label: "Married" },
    { id: 4, label: "Separated" },
    { id: 3, label: "Widower" },
  ],
  uniqueOccupationCategories: [
    { id: 1, label: "Agriculture and forestry" },
    { id: 2, label: "Mining and quarrying" },
  ],
  uniqueBirthYears: ["1880", "1890", "1900"],
  uniqueDeathYears: ["1915", "1920", "1930"],
  sortedRanks: {
    Officers: [
      { id: 10, label: "Major" },
      { id: 11, label: "Captain" },
    ],
    "Non-Commissioned Officers": [
      { id: 20, label: "Sergeant" },
      { id: 21, label: "Corporal" },
    ],
    "Other Ranks": [
      { id: 30, label: "Private" },
      { id: 31, label: "Lance Corporal" },
    ],
  },
  filters: {
    detachment: [],
    corps: [],
    maritalStatus: null,
    occupationCategory: null,
    birthYear: ["1880", "1900"],
    deathYear: ["1915", "1930"],
    ranks: {
      Officers: [],
      "Non-Commissioned Officers": [],
      "Other Ranks": [],
    },
    unknownDeathYear: "",
  },
  startBirthYear: "1880",
  endBirthYear: "1900",
  startDeathYear: "1915",
  endDeathYear: "1930",
  handleDetachmentFilter: jest.fn(),
  handleCorpsFilter: jest.fn(),
  handleMaritalStatusFilter: jest.fn(),
  handleOccupationCategoryFilter: jest.fn(),
  handleBirthSliderChange: jest.fn(),
  handleDeathSliderChange: jest.fn(),
  handleSliderDragStart: jest.fn(),
  handleSliderDragComplete: jest.fn(),
  handleRankFilter: jest.fn(),
  handleUnknownDeathYear: jest.fn(),
};

describe("RollFilter", () => {
  test("renders the detachment filters", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Detachments")).toBeInTheDocument();
    expect(screen.getByLabelText("Main Body")).toBeInTheDocument();
    expect(screen.getByLabelText("1st Reinforcements")).toBeInTheDocument();
  });

  test("renders the corps filters", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Corps")).toBeInTheDocument();
    expect(screen.getByLabelText("Tunnelling Corps")).toBeInTheDocument();
    expect(screen.getByLabelText("Engineers")).toBeInTheDocument();
  });

  test("renders the marital status filters", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Marital Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Married")).toBeInTheDocument();
    expect(screen.getByLabelText("Single")).toBeInTheDocument();
    expect(screen.getByLabelText("Separated")).toBeInTheDocument();
    expect(screen.getByLabelText("Widower")).toBeInTheDocument();
    expect(screen.queryByLabelText("Unknown")).not.toBeInTheDocument();
  });

  test("renders the occupation category dropdown", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Occupation category")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Occupation category" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "All occupations" }));
    expect(
      screen.getByRole("option", { name: "Mining and quarrying" }),
    ).toBeInTheDocument();
  });

  test("renders the birth year slider", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Birth")).toBeInTheDocument();
    expect(screen.getByText("1880-1900")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Birth year start" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Birth year end" }),
    ).toBeInTheDocument();
  });

  test("renders the death year slider", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Death")).toBeInTheDocument();
    expect(screen.getByText("1915-1930")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Death year start" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Death year end" }),
    ).toBeInTheDocument();
  });

  test("renders the rank filters", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Ranks")).toBeInTheDocument();
    expect(screen.getByLabelText("Officers")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Non-Commissioned Officers"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Other Ranks")).toBeInTheDocument();
  });

  test("calls handleDetachmentFilter when a detachment checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Main Body");
    fireEvent.click(checkbox);
    expect(defaultProps.handleDetachmentFilter).toHaveBeenCalledWith(1);
  });

  test("calls handleCorpsFilter when a corps checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Tunnelling Corps");
    fireEvent.click(checkbox);
    expect(defaultProps.handleCorpsFilter).toHaveBeenCalledWith(null);
  });

  test("calls handleMaritalStatusFilter when a marital status checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Married");
    fireEvent.click(checkbox);
    expect(defaultProps.handleMaritalStatusFilter).toHaveBeenCalledWith(2);
  });

  test("calls handleOccupationCategoryFilter when an occupation category is selected", () => {
    render(<RollFilter {...defaultProps} />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Occupation category" }),
      {
        target: { value: "2" },
      },
    );
    expect(defaultProps.handleOccupationCategoryFilter).toHaveBeenCalledWith(2);
  });

  test("marks only the selected marital status as checked", () => {
    render(
      <RollFilter
        {...defaultProps}
        filters={{ ...defaultProps.filters, maritalStatus: 2 }}
      />,
    );

    expect(screen.getByLabelText("Married")).toBeChecked();
    expect(screen.getByLabelText("Single")).not.toBeChecked();
  });

  test("calls handleRankFilter when a rank checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Major");
    fireEvent.click(checkbox);
    expect(defaultProps.handleRankFilter).toHaveBeenCalledWith({
      Officers: [10],
    });
  });

  test("calls handleUnknownDeathYear when the unknown death year checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Unknown death year");
    fireEvent.click(checkbox);
    expect(defaultProps.handleUnknownDeathYear).toHaveBeenCalledWith("unknown");
  });
});
