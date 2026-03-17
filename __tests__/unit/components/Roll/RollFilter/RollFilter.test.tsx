import { render, screen, fireEvent } from "@testing-library/react";

import { RollFilter } from "@/components/Roll/RollFilter/RollFilter";

const defaultProps = {
  className: "test-class",
  uniqueDetachments: ["Main Body", "1st Reinforcements"],
  uniquecorps: ["Tunnelling Corps", "Engineers"],
  uniqueBirthYears: ["1880", "1890", "1900"],
  uniqueDeathYears: ["1915", "1920", "1930"],
  sortedRanks: {
    Officers: ["Major", "Captain"],
    "Non-Commissioned Officers": ["Sergeant", "Corporal"],
    "Other Ranks": ["Private", "Lance Corporal"],
  },
  filters: {
    detachment: [],
    corps: [],
    birthYear: ["1880", "1900"],
    deathYear: ["1915", "1930"],
    ranks: {
      Officers: [],
      "Non-Commissioned Officers": [],
      "Other Ranks": [],
    },
    unknownBirthYear: "",
    unknownDeathYear: "",
  },
  startBirthYear: "1880",
  endBirthYear: "1900",
  startDeathYear: "1915",
  endDeathYear: "1930",
  handleDetachmentFilter: jest.fn(),
  handleCorpsFilter: jest.fn(),
  handleBirthSliderChange: jest.fn(),
  handleDeathSliderChange: jest.fn(),
  handleRankFilter: jest.fn(),
  handleUnknwonBirthYear: jest.fn(),
  handleUnknwonDeathYear: jest.fn(),
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

  test("renders the birth year slider", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Birth")).toBeInTheDocument();
    expect(screen.getByText("1880-1900")).toBeInTheDocument();
  });

  test("renders the death year slider", () => {
    render(<RollFilter {...defaultProps} />);
    expect(screen.getByText("Death")).toBeInTheDocument();
    expect(screen.getByText("1915-1930")).toBeInTheDocument();
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
    expect(defaultProps.handleDetachmentFilter).toHaveBeenCalledWith(
      "Main Body",
    );
  });

  test("calls handleCorpsFilter when a corps checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Tunnelling Corps");
    fireEvent.click(checkbox);
    expect(defaultProps.handleCorpsFilter).toHaveBeenCalledWith(
      "Tunnelling Corps",
    );
  });

  test("calls handleRankFilter when a rank checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Major");
    fireEvent.click(checkbox);
    expect(defaultProps.handleRankFilter).toHaveBeenCalledWith({
      Officers: ["Major"],
    });
  });

  test("calls handleUnknwonBirthYear when the unknown birth year checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Unknown birth year");
    fireEvent.click(checkbox);
    expect(defaultProps.handleUnknwonBirthYear).toHaveBeenCalledWith("unknown");
  });

  test("calls handleUnknwonDeathYear when the unknown death year checkbox is clicked", () => {
    render(<RollFilter {...defaultProps} />);
    const checkbox = screen.getByLabelText("Unknown death year");
    fireEvent.click(checkbox);
    expect(defaultProps.handleUnknwonDeathYear).toHaveBeenCalledWith("unknown");
  });
});
