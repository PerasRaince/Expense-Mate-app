export default function SearchBar({ setSearch }) {
  return (
    <input
      placeholder="Search by date or item"
      onChange={(e) => setSearch(e.target.value.toLowerCase())}
    />
  );
}
