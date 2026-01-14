/**
 * Error display component
 */

interface ErrorProps {
  message?: string;
}

export const Error = ({ message = "An error occurred" }: ErrorProps) => {
  return (
    <div style={{ padding: "2rem", color: "red" }}>
      <strong>Error:</strong> {message}
    </div>
  );
};
