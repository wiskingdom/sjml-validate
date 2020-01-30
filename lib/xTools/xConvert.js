const xConvert = container => {
  const { inputFileName } = container;
  
  const outputFileName = inputFileName;
  return { ...container, outputFileName };
} 

module.exports = { xConvert };