import React, { FC } from 'react';

type Props = {
    text: string
    boundingBoxWidth?: number,
    boundingBoxOriginX?: number,
    boundingBoxoriginY?: number
}

export const ConfidenceScore: FC<Props> = ({text, boundingBoxWidth, boundingBoxOriginX, boundingBoxoriginY}) => {

    console.log(boundingBoxWidth);
    console.log(boundingBoxOriginX);
    console.log(boundingBoxoriginY);
    return (
        <p> Confidence: ${text}</p>
    )
}