// pages/api/animal-data.js
// Endpoint to store and retrieve single latest animal data

// Only store the latest entry - no history
let latestAnimalData = null;

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            // Store new animal data (replaces previous)
            const { jobId, generation, displayName, timestamp, source } = req.body;

            // Validate required fields
            if (!jobId || !generation || !displayName) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['jobId', 'generation', 'displayName']
                });
            }

            // Create animal data object (overwrites previous)
            latestAnimalData = {
                jobId: jobId.trim(),
                generation: generation.trim(),
                displayName: displayName.trim(),
                timestamp: timestamp || new Date().toISOString(),
                source: source || 'unknown',
                id: Date.now()
            };

            console.log('Stored new animal data (replaced previous):', latestAnimalData);

            return res.status(200).json({
                success: true,
                message: 'Animal data stored successfully (previous data replaced)',
                data: latestAnimalData
            });

        } else if (req.method === 'GET') {
            // Return only the latest animal data
            return res.status(200).json({
                success: true,
                data: latestAnimalData,
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
        console.error('API Error:', error);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
