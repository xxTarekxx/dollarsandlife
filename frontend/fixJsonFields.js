import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to your data directory
const dataDir = join(__dirname, 'public', 'data');

// Files to exclude from processing
const excludedFiles = ['manifest.json', 'products.json', 'taxBrackets.json'];

// Function to process a single JSON file
function processFile(filePath) {
    try {
        console.log(`Processing file: ${filePath}`);

        // Read the file
        const rawData = readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);

        // Fields to check and convert to arrays if they're strings
        const fieldsToCheck = [
            'expertQuotes',
            'caseStudies',
            'authorityLinks',
            'personalTips',
            'stats'
        ];

        // Recursive function to process nested objects
        function processObject(obj) {
            if (Array.isArray(obj)) {
                // If it's an array, process each item
                return obj.map(item => processObject(item));
            } else if (obj && typeof obj === 'object') {
                // If it's an object, process each property
                const newObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        // Process the value
                        newObj[key] = processObject(obj[key]);

                        // Convert specified fields to arrays if they're strings
                        if (fieldsToCheck.includes(key)) {
                            if (typeof newObj[key] === 'string') {
                                console.log(`Converting ${key} from string to array`);
                                newObj[key] = [newObj[key]];
                            } else if (!Array.isArray(newObj[key])) {
                                console.log(`Field ${key} is neither string nor array (type: ${typeof newObj[key]})`);
                            }
                        }
                    }
                }
                return newObj;
            }
            // Return primitives unchanged
            return obj;
        }

        // Process the entire data structure
        const processedData = processObject(data);

        // Write the modified data back to the file
        writeFileSync(filePath, JSON.stringify(processedData, null, 2));
        console.log(`Successfully updated ${filePath}`);

        return processedData;

    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return null;
    }
}

// Main function to process all JSON files in the directory
function processAllFiles() {
    try {
        // Get all files in the directory
        const files = readdirSync(dataDir);

        // Filter for JSON files and exclude specific files
        const jsonFiles = files.filter(file =>
            file.endsWith('.json') && !excludedFiles.includes(file)
        );

        if (jsonFiles.length === 0) {
            console.log('No JSON files found in', dataDir);
            return;
        }

        console.log('Files to process:', jsonFiles);

        // Process each JSON file
        jsonFiles.forEach(file => {
            const filePath = join(dataDir, file);
            processFile(filePath);
        });

        console.log('All files processed successfully!');

    } catch (error) {
        console.error('Error reading directory:', error);
    }
}

// Run the script
processAllFiles();