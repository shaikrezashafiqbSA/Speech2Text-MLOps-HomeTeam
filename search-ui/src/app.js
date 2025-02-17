import React, { useState } from 'react';
import { SearchProvider, SearchBox, Results } from '@elastic/react-search-ui';
import { Layout } from '@elastic/react-search-ui-views';
import '@elastic/react-search-ui-views/lib/styles/styles.css';

console.log("Initializing component");

const connector = {
  search: async (state) => {
    console.log('Search state in connector:', state); 

    const query = {
      wildcard: {
        generated_text: `*${state.searchTerm}*`
      }
    };
    // {
    //   "query": {
    //     "wildcard": {
    //       "generated_text": "*cat*" 
    //     }
    //   }
    // }

    console.log('Search query:', query);

    const response = await fetch(
      `http://localhost:9200/cv-transcriptions/_search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            bool: {
              must: [query]
            }
          }
        })
      }
    );
    const result = await response.json();
    console.log('Elasticsearch response:', result);
    return result;
  }
};

const config = {
  apiConnector: connector,
  alwaysSearchOnInitialLoad: true,
  searchQuery: {
    result_fields: {
      generated_text: { raw: {} }
    }
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]); // Add state to manage search results
  

  const handleInputChange = (e) => {
    const { value } = e.target;
    console.log(`Input change: ${value}`); 
    setSearchTerm(value);
  };

  const handleSearch = async () => {
    console.log('Search button clicked');
    console.log('Current search term:', searchTerm);
    try {
      const result = await connector.search({ searchTerm });
      console.log('Search results:', result);
      setResults(result.hits.hits); // Set search results
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (

    <SearchProvider config={config}>
      <div className="App" style={{ padding: '20px' }}>
        <h1>ASR Transcription Search</h1>
        <div>
          <input
            type="text"
            placeholder="Search generated_text..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div>
          {/* Results Display */}
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
        </div>
      </div>
    </SearchProvider>
  );
}

function ResultRow({ id, result }) {
  // console.log('Rendering result:', result); // Debugging: Log the result being rendered
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
