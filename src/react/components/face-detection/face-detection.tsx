import React, { FC } from 'react';

export const FaceDetection: FC = () => {
    return (
        <button onClick={() => console.log(`Detecting...`)}> Detect Face </button>
    )
}