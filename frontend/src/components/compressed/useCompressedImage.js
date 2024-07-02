import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

const useCompressedImage = (src) => {
    const [compressedSrc, setCompressedSrc] = useState("");

    useEffect(() => {
        const compressImage = async () => {
            try {
                const response = await fetch(src);
                const blob = await response.blob();
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(blob, options);
                setCompressedSrc(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error('Error compressing image:', error);
            }
        };

        compressImage();
    }, [src]);

    return compressedSrc;
};

export default useCompressedImage;
