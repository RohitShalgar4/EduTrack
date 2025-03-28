import dotenv from "dotenv";
dotenv.config({});

export const getCloudinaryConfig = async (req, res) => {
  try {
    // Log environment variables for debugging
    console.log('Environment variables:', {
      cloudName: process.env.CLOUD_NAME,
      uploadPreset: process.env.UPLOAD_PRESET
    });

    // Return only the necessary configuration for client-side upload
    const config = {
      cloudName: process.env.CLOUD_NAME,
      uploadPreset: process.env.UPLOAD_PRESET
    };

    if (!config.cloudName || !config.uploadPreset) {
      console.error('Missing Cloudinary configuration:', config);
      return res.status(500).json({ 
        message: 'Cloudinary configuration is incomplete',
        config 
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error getting Cloudinary config:', error);
    res.status(500).json({ message: 'Error getting Cloudinary configuration' });
  }
}; 