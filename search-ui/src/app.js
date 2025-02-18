import React, { useState } from 'react';
import { SearchProvider } from '@elastic/react-search-ui';
import '@elastic/react-search-ui-views/lib/styles/styles.css';

console.log("Initializing component");

const connector = {
  search: async (state) => {
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
      mustQueries.push({
        wildcard: {
          generated_text: `*${state.searchFields.generated_text}*`
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
      return { hits: { hits: [] } }; // Return no results if no search criteria
    }
    const query = {
      bool: {
        must: mustQueries
      }
    };

    console.log('Search query:', query);

    const response = await fetch(
      `http://localhost:9200/cv-transcriptions/_search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query
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
      generated_text: { raw: {} },
      duration: { raw: {} },
      age: { raw: {} },
      gender: { raw: {} },
      accent: { raw: {} }
    }
  }
};

function App() {
  const [searchFields, setSearchFields] = useState({
    id: '',
    generated_text: '',
    duration: '',
    age: '',
    gender: '',
    accent: ''
  });
  const [results, setResults] = useState([]); // Add state to manage search results

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}: ${value}`);
    setSearchFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSearch = async () => {
    console.log('Search button clicked');
    console.log('Current search fields:', searchFields);
    try {
      const result = await connector.search({ searchFields });
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
  // console.log('Rendering result:', result); 
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
