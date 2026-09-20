import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError("Cannot reach the backend"));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>TrahoDoc</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {health && <p>Backend status: {health.status}</p>}
    </div>
  );
}

export default App;