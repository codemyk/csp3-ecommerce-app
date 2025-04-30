import { useState } from "react";

export default function SetAsAdminPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleSetAsAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/${userId}/set-as-admin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set user as admin");
      }

      const data = await response.json();
      setToastType("success");
      setToastMessage(`User ${data.updatedUser.firstName} is now an Admin.`);
      setUserId("");
    } catch (error) {
      setToastType("danger");
      setToastMessage(error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4">Set User as Admin</h1>

      {toastMessage && (
        <div className={`toast-container position-fixed top-0 end-0 p-3`} style={{ zIndex: 1055 }}>
          <div className={`toast show align-items-center text-white bg-${toastType} border-0`} role="alert">
            <div className="d-flex">
              <div className="toast-body">
                {toastMessage}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToastMessage("")}></button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSetAsAdmin} className="d-flex flex-column align-items-center">
            <div className="mb-3 w-50">
              <input
                type="text"
                className="form-control"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-20 mt-3"
              disabled={loading}
            >
              {loading ? "Setting as Admin..." : "Set as Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}