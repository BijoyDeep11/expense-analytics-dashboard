import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Loading auth...</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      <pre style={{ background: "#eee", padding: "10px" }}>
        {JSON.stringify(user, null, 2)}
      </pre>

      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <div>
          <Link to="/login">
            <button>Login</button>
          </Link>

          <Link to="/signup">
            <button>Signup</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
