import React, { FC, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

type Props = {
    mirror?: boolean;
}

export const WebcamComponent: FC<Props> = ({ mirror = true }) => {
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    const StyledVideo = mirror ? styled.video`
        transform: rotateY(180deg);
        -webkit-transform:rotateY(180deg); /* Safari and Chrome */
        -moz-transform:rotateY(180deg); /* Firefox */
    ` : styled.video``; 

    useEffect(() => {
        const getMediaStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                console.log(`set mediaStream`);
            } catch (error) {
                console.error('Error Accessing webcam:', error);
            }
        };

        getMediaStream();
    }, [])

    useEffect(() => {
        console.log(`!!stream`, !!stream);
        if (stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream])

    return (
        <div>
            {stream &&
                <StyledVideo ref={videoRef} autoPlay />
            }
        </div>
    )
}