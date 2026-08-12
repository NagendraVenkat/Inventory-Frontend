function SearchBar({
  searchTerm,
  setSearchTerm,
  onAddClick,
  placeholder,
  buttonText,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 w-100">

      {/* Search */}
      <div className="input-group search-box">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>

        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Button */}
      <button
        className="btn btn-primary add-btn"
        onClick={onAddClick}
      >
        <i className="bi bi-plus-lg me-2"></i>
        {buttonText}
      </button>

    </div>
  );
}

export default SearchBar;