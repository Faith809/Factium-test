
// Web Worker for processing captured media to avoid UI lag
self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === 'process-image') {
    // In a real worker, we might do resizing or format conversion here
    // For now, we just simulate processing time and return the data
    // This keeps the main thread free from large data handling
    self.postMessage({ type: 'processed', data });
  } else if (type === 'process-audio') {
    // Process audio chunks or convert to base64
    self.postMessage({ type: 'processed', data });
  }
};
