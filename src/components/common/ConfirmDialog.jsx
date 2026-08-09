function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  message = "Are you sure you want to continue?",
  loading = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">

        <h3>Confirm Action</h3>

        <p>{message}</p>

        <div className="confirm-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="deactivate-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deactivating..." : "Deactivate"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ConfirmDialog;