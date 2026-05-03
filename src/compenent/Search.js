function Search({ searchValue, onSearchChange }) {
  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        className="search-input"
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button className="search-btn" type="submit">
        Search
      </button>
    </form>
  );
}

export default Search;