import { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
    const [value, setValue] = useState("");
    const inputRef = useRef(null);

    function handleChange(e) {
        const newValue = e.target.value;
        setValue(newValue);
        onSearch(newValue);
    }

    function handleClear() {
        setValue("");
        onSearch("");
        inputRef.current?.focus();
    }

    return (
        <div className="search-bar">
            <div className="search-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search Movies..."
                    value={value}
                    onChange={handleChange}
                />
                {value && (
                    <button
                        className="search-clear-btn"
                        onClick={handleClear}
                        aria-label="Clear search"
                        title="Clear"
                    >
                        <IoClose />
                    </button>
                )}
            </div>
        </div>
    );
}

export default SearchBar;