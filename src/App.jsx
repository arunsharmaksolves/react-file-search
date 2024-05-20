import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const App = () => {
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);

  const handleFileUpload = (e) => {
    console.log(e)
    setFile(e.target.files[0]);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (file) {
      const numPages = await file.pdfInfo.numPages;
      const results = [];
      const regex = new RegExp(`(${query})`, 'gi');
  
      for (let i = 1; i <= numPages; i++) {
        const page = await file.pdfInfo.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
          const text = item.str;
          const matches = text.match(regex);
          if (matches) {
            matches.forEach((match) => {
              results.push({
                page: i,
                match,
              });
            });
          }
        });
      }
  
      setSearchResults(results);
      setSelectedEntryIndex(0);
    }
  };
  
  

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };

  const goToNextEntry = () => {
    setSelectedEntryIndex((prevIndex) => (prevIndex + 1) % searchResults.length);
  };

  const goToPreviousEntry = () => {
    setSelectedEntryIndex((prevIndex) => (prevIndex - 1 + searchResults.length) % searchResults.length);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="App">
      <h1>PDF Highlighter</h1>
      <div>
        <input type="file" onChange={(e) => handleFileUpload(e)} />
      </div>
      <div>
        <input type="text" placeholder="Enter search query" onChange={(e) => handleSearch(e.target.value)} />
      </div>
      
      <div className="pdf-preview">
        {file && (
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                customTextRenderer={({ str }) =>
                  highlightText(str, searchQuery) +
                  (searchResults[selectedEntryIndex]?.page === index + 1 ? '<span class="highlight-selected"></span>' : '')
                }
              />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
};

export default App;