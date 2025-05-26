// src/components/NextJsImage.js
'use client';

import Image from 'next/image';
import {
    isImageFitCover,
    isImageSlide,
    useLightboxProps,
    useLightboxState,
} from 'yet-another-react-lightbox';

function isNextJsImage(slide) {
    return isImageSlide(slide);
}

export default function NextJsImage({ slide, offset, rect }) {
    const {
        on: { click },
        carousel: { imageFit },
    } = useLightboxProps();

    const { currentIndex } = useLightboxState();

    const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit);

    if (!isNextJsImage(slide)) return undefined;

    // Use the full rect size provided by the lightbox for the container.
    const width = rect.width;
    const height = rect.height;

    // If rect isn't ready yet (width or height is 0), don't render.
    // This prevents the warning during initial render or transitions.
    if (!width || !height) {
        return null;
    }

    return (
        <div style={{ position: 'relative', width, height }}>
            <Image
                fill // Use fill to cover the div
                alt={slide.alt || "Lightbox image"}
                src={slide.src}
                loading="eager"
                draggable={false}
                style={{
                    objectFit: cover ? 'cover' : 'contain', // Use 'contain' to fit without cropping
                    cursor: click ? 'pointer' : undefined,
                }}
                // Provide a 'sizes' prop to help Next.js choose the right source image.
                // 100vw is a reasonable default for a full-screen lightbox.
                sizes="100vw"
                onClick={offset === 0 ? () => click?.({ index: currentIndex }) : undefined}
            />
        </div>
    );
}