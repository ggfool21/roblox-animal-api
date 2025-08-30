// pages/api/animal-data.js
// Endpoint to store and retrieve animal data

// In-memory storage (you can replace with database later)
let latestAnimalData = null;
let animalHistory = [];
const MAX_HISTORY = 50; // Keep last 50 entries

export default async function handler(req, res) {
    // Enable CORS for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            // Store new animal data
            const { jobId, generation, displayName, timestamp, source } = req.body;

            // Validate required fields
            if (!jobId || !generation || !displayName) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['jobId', 'generation', 'displayName']
                });
            }

            // Create animal data object
            const animalData = {
                jobId: jobId.trim(),
                generation: generation.trim(),
                displayName: displayName.trim(),
                timestamp: timestamp || new Date().toISOString(),
                source: source || 'unknown',
                id: Date.now() // Simple ID generation
            };

            // Store as latest
            latestAnimalData = animalData;

            // Add to history
            animalHistory.unshift(animalData);
            
            // Trim history if needed
            if (animalHistory.length > MAX_HISTORY) {
                animalHistory = animalHistory.slice(0, MAX_HISTORY);
            }

            console.log('✅ Stored animal data:', animalData);

            return res.status(200).json({
                success: true,
                message: 'Animal data stored successfully',
                data: animalData
            });

        } else if (req.method === 'GET') {
            // Retrieve animal data
            const { latest, history, limit } = req.query;

            if (latest === 'true') {
                // Return only the latest animal data
                return res.status(200).json({
                    success: true,
                    data: latestAnimalData,
                    hasData: latestAnimalData !== null
                });
            }

            if (history === 'true') {
                // Return history with optional limit
                const historyLimit = limit ? parseInt(limit) : 10;
                const limitedHistory = animalHistory.slice(0, historyLimit);
                
                return res.status(200).json({
                    success: true,
                    data: limitedHistory,
                    total: animalHistory.length
                });
            }

            // Default: return both latest and recent history
            return res.status(200).json({
                success: true,
                latest: latestAnimalData,
                history: animalHistory.slice(0, 5), // Last 5 entries
                totalHistory: animalHistory.length,
                hasData: latestAnimalData !== null
            });

        } else {
            // Method not allowed
            return res.status(405).json({
                error: 'Method not allowed',
                allowedMethods: ['GET', 'POST']
            });
        }

    } catch (error) {
        console.error('❌ API Error:', error);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
