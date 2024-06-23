import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

const useCompressedImage = (src) => {
    const [compressedSrc, setCompressedSrc] = useState("");

    useEffect(() => {
        const compressImage = async () => {
            try {
                const img = new Image();
                img.src = src;
                await img.decode();  // wait until image is decoded
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(img, options);
                setCompressedSrc(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error(error);
            }
        };

        compressImage();
    }, [src]);

    return compressedSrc;
};

export default useCompressedImage;
