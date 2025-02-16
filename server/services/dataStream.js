const { Transform } = require('stream');

// Stream transformer for financial data
const dataTransformer = new Transform({
  objectMode: true,
  highWaterMark: 64, // Lower buffer size for memory efficiency
  transform(chunk, encoding, callback) {
    // Process data in smaller chunks
    try {
      const transformedData = processDataChunk(chunk);
      callback(null, transformedData);
    } catch (error) {
      callback(error);
    }
  }
});

// Memory-efficient data processing
const processDataChunk = (chunk) => {
  // Process data in memory-efficient way
  return chunk;
}; 