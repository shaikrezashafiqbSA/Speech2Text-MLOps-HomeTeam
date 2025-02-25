import React, { useState } from 'react';
import { SearchProvider } from '@elastic/react-search-ui';
import '@elastic/react-search-ui-views/lib/styles/styles.css';
console.log("Initializing component");

const apiUrl = process.env.REACT_APP_API_URL; //

const connector = {
  search: async (state, from = 0, size = 20) => {
    console.log('Search state in connector:', state);

    const mustQueries = [];

    if (state.searchFields.id) {
      mustQueries.push({
        term: {
          _id: state.searchFields.id
        }
      });
    }
    if (state.searchFields.generated_text) {
      const searchText = state.searchFields.generated_text.trim(); // Trim whitespace
      mustQueries.push({
        match: {
          generated_text: {
            query: searchText,
            operator: "and"
          }
        }
      });
    }
    if (state.searchFields.duration) {
      mustQueries.push({
        range: {
          duration: {
            lte: parseFloat(state.searchFields.duration)
          }
        }
      });
    }
    if (state.searchFields.age) {
      mustQueries.push({
        range: {
          age: {
            lte: parseInt(state.searchFields.age)
          }
        }
      });
    }
    if (state.searchFields.gender) {
      mustQueries.push({
        wildcard: {
          gender: `*${state.searchFields.gender}*`
        }
      });
    }
    if (state.searchFields.accent) {
      mustQueries.push({
        wildcard: {
          accent: `*${state.searchFields.accent}*`
        }
      });
    }
    if (mustQueries.length === 0) {
      console.log('No search criteria provided. Returning no results.');
      return { hits: { hits: [], total: 0 } }; // Return no results if no search criteria
    }
    const query = {
      bool: {
        must: mustQueries
      }
    };

    console.log('Search query:', query);

    const username = state.username; // Get username from search state
    const password = state.password; // Get password from search state

    if (!username || !password) {
      throw new Error("Username and password are required.");
    }

    const response = await fetch(
      `${apiUrl}/cv-transcriptions/_search?from=${from}&size=${size}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${username}:${password}`) // Use the generated password here
        },
        body: JSON.stringify({
          query: query
        })
      }
    );
    if (!response.ok) { // Check for HTTP errors (crucial)
      const errorText = await response.text(); // Get the error message from the server
      throw new Error(`Search request failed with status ${response.status}: ${errorText}`); // Throw a more informative error
    }

    const result = await response.json();
    console.log('Elasticsearch response:', result);
    return result.hits ? result : { hits: { hits: [], total: 0 } }; // Ensure hits is defined
  }
};

const config = {
  apiConnector: connector,
  alwaysSearchOnInitialLoad: true,
  searchQuery: {
    result_fields: {
      generated_text: { raw: {} },
      duration: { raw: {} },
      age: { raw: {} },
      gender: { raw: {} },
      accent: { raw: {} }
    }
  }
};

function App() {
  console.log("API URL:", apiUrl);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('wethecitizensofsingapore');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Track login status

  const [searchFields, setSearchFields] = useState({
    id: '',
    generated_text: '',
    duration: '',
    age: '',
    gender: '',
    accent: ''
  });
  const [results, setResults] = useState([]); // State to manage search results
  const [totalResults, setTotalResults] = useState(0); // State to manage total results count
  const [page, setPage] = useState(0); // State to keep track of the current page

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}: ${value}`);
    setSearchFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSearch = async (page = 0) => {
    console.log('Search button clicked');
    console.log('Current search fields:', searchFields);
    try {
      const result = await connector.search({ searchFields, username, password }, page * 20, 20);
      console.log('Search results:', result);
      setResults(result.hits.hits || []);
      setTotalResults(result.hits.total.value || 0); // Set total results count
    } catch (error) {
      console.error('Search error:', error);
      setResults([]); // Handle the error by clearing results
      setTotalResults(0); // Reset total results count
    }
  };

  const handleNextPage = () => {
    setPage(prevPage => {
      const nextPage = prevPage + 1;
      handleSearch(nextPage);
      return nextPage;
    });
  };

  const handlePrevPage = () => {
    setPage(prevPage => {
      const prevPageIndex = prevPage > 0 ? prevPage - 1 : 0;
      handleSearch(prevPageIndex);
      return prevPageIndex;
    });
  };

  return (
    <SearchProvider config={config}>
      <div className="App" style={{ padding: '20px' }}>
        <h1>ASR Transcription Search</h1>
        <div>
          <input
            type="text"
            name="id"
            placeholder="Search ID..."
            value={searchFields.id}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="generated_text"
            placeholder="Search Text..."
            value={searchFields.generated_text}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="duration"
            placeholder="Search Duration..."
            value={searchFields.duration}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="age"
            placeholder="Search Age..."
            value={searchFields.age}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="gender"
            placeholder="Search Gender..."
            value={searchFields.gender}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="accent"
            placeholder="Search Accent..."
            value={searchFields.accent}
            onChange={handleInputChange}
          />
          <button onClick={() => handleSearch(0)}>Search</button>
        </div>
        <div>
          {/* Display total results count */}
          <p>Total Results: {totalResults}</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Text</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Duration</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Age</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Gender</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Accent</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <ResultRow key={index} id={result._id} result={result._source} />
              ))}
            </tbody>
          </table>
          <div>
            <button onClick={handlePrevPage} disabled={page === 0}>Previous</button>
            <button onClick={handleNextPage} disabled={results.length < 20}>Next</button>
            <span style={{ marginLeft: '10px' }}>Page {page + 1}</span>
          </div>
        </div>
      </div>
    </SearchProvider>
  );
}

function ResultRow({ id, result }) {
  return (
    <tr>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{id}</td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.generated_text ? result.generated_text : "No data available"}</td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.duration ? result.duration : "No data available"}</td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.age ? result.age : "No data available"}</td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.gender ? result.gender : "No data available"}</td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.accent ? result.accent : "No data available"}</td>
    </tr>
  );
}

export default App;
