function SearchBar({
  searchTerm,
  setSearchTerm,
  onAddClick,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3 gap-3">

  <input
    type="text"
    className="form-control"
    placeholder="Search category..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <button
  className="btn btn-primary px-4 text-nowrap"
  onClick={onAddClick}
>
  <i className="bi bi-plus-lg me-2"></i>
  Add Category
</button>

</div>
  );
}

export default SearchBar;