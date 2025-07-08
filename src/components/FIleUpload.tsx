import React, { useState } from 'react';
import { Button, Input, Typography, Box, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import API from '@/api';

const FileUpload = ({onUploadSuccess, label}) => {
  const api = API()
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [imageUrl, setImageUrl] = useState();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
    
        if (!file) {
          console.warn("🛑 No file selected.");
          return;
        } else {
          setImageUrl(URL.createObjectURL(file))
        }
    
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          alert("Invalid file type! Please upload an image (PNG, JPG, JPEG).");
          return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
    
        try {
          const response = await api.post(`/files/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data', // Axios handles this, but adding explicitly helps debugging
            },
          });
    
          console.log("✅ File uploaded successfully:", response);
          onUploadSuccess(response)
          alert(`File uploaded: ${response.filePath}`);
        } catch (error: any) {
          if (error.response) {
            console.error("🛑 Server Error:", error.response);
            alert(`Upload failed: ${error.response.message}`);
          } else if (error.request) {
            console.error("🛑 No response received:", error.request);
            alert("No response from server. Check your network.");
          } else {
            console.error("🛑 Request Error:", error.message);
            alert("Error uploading file. Please try again.");
          }
        }
      };

    return (
        <Box className="file-upload-container" sx={{  p: 2 }}>
            <Input
                accept="*"
                type="file"
                id="file-input"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Upload button */}
            <label htmlFor="file-input">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                >
                    {label}
                </Button>
            </label>

            {/* Display selected file name */}
            {file && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Selected File: {file.name}
                </Typography>
            )}

            
            {/* Display API Response */}
            {response && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" color="green">
                        Upload Successful: {JSON.stringify(response)}
                    </Typography>
                </Box>
            )}

            {/* Display Error Message */}
            {error && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" color="red">
                        {error}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default FileUpload;
