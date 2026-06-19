import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the Field Ops header", () => {
  render(<App />);
  const header = screen.getByText(/field ops/i);
  expect(header).toBeInTheDocument();
});
