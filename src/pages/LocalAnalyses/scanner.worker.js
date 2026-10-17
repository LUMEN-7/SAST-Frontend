import { scanText, validateFiles } from "../../services/localScanner";
self.onmessage = async ({ data: files }) => {
  try {
    validateFiles(files);
    const results = [];
    for (const file of files) {
      results.push({ name: file.name, size: file.size, ...scanText(await file.text(), file.name) });
    }
    self.postMessage({ results });
  } catch (error) { self.postMessage({ error: error.message }); }
};
