// components/ui/SearchInput.js
const SearchInput = ({ placeholder }) => {
  return (
    <div className="header-search">
      <div className="search-icon">🔍</div>
      <input 
        type="text" 
        className="search-input" 
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchInput;