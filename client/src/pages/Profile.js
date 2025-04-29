import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(
          "https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/users/details",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
 	          "Authorization": `Bearer ${localStorage.getItem("token")}`, 
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Here you would normally send the password to your API
    setShowSuccess(true);
    setPassword("");
    setConfirmPassword("");

    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container my-5">
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Password changed successfully!
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowSuccess(false)}
          ></button>
        </div>
      )}

      <h1 className="mb-4">Profile Page</h1>
      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-3">
            <strong>ID:</strong> {user._id}
          </div>
          <div className="mb-3">
            <strong>First Name:</strong> {user.firstName}
          </div>
          <div className="mb-3">
            <strong>Last Name:</strong> {user.lastName}
          </div>
          <div className="mb-3">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="mb-3">
            <strong>Mobile No:</strong> {user.mobileNo}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h5 mb-3">Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}