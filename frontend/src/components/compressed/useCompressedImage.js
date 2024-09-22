import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

const useCompressedImage = (src) => {
    const [compressedSrc, setCompressedSrc] = useState("");

    useEffect(() => {
        const compressImage = async () => {
            try {
                // Fetch the file from the given source URL
                const response = await fetch(src);

                // Validate if the response is OK and if the fetched file is an image
                if (!response.ok) {
                    throw new Error(`Failed to fetch image. Status: ${response.status}`);
                }

                const contentType = response.headers.get("content-type");

                // Check if the content type starts with "image"
                if (!contentType || !contentType.startsWith("image")) {
                    throw new Error(`The file fetched is not an image. Content-Type: ${contentType}`);
                }

                const blob = await response.blob();

                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                // Compress the image
                const compressedFile = await imageCompression(blob, options);
                setCompressedSrc(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error('Error compressing image:', error, 'Source:', src);
            }
        };

        // Only try to compress the image if a source is provided
        if (src) {
            compressImage();
        }
    }, [src]);

    return compressedSrc;
};

export default useCompressedImage;
