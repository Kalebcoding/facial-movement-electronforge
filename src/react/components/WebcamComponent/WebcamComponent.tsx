import React, { FC, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';



const StyledVideo = styled.video`
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
`

type Props = {
    mirror?: boolean;
}

export const WebcamComponent: FC<Props> = ({ mirror = true }) => {
    const [stream, setStream] = useState(null);
    const [faceLandmarker, setFaceLandmaker] = useState<FaceLandmarker>(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const liveView = useRef(null);


    useEffect(() => {
        const getMediaStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
            } catch (error) {
                console.error('Error Accessing webcam:', error);
            }
        };

        const initFaceLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            const result = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 1,
            })

            setFaceLandmaker(result)
        }
        initFaceLandmarker();
        getMediaStream();
    }, [])

    useEffect(() => {
        if (stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", trackFace)
        }
    }, [stream])

    const trackFace = async () => {
        let lastVideoTime = -1;
        let startTimeMs = performance.now();
        if (videoRef.current.currentTime != lastVideoTime) {
            lastVideoTime = videoRef.current.currentTime;
            const detections = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);
            const jawOpenVal = detections?.faceBlendshapes[0]?.categories[25].score * 100;
            if(jawOpenVal > 50 && audioRef.current.paused){
                audioRef.current.play();
            }

            if(jawOpenVal < 50 && !audioRef.current.paused){
                audioRef.current.pause();
            }
        }

        window.requestAnimationFrame(trackFace);
    }


    return (
        <div id="live-view-container" ref={liveView}>
            {stream &&
                <StyledVideo ref={videoRef} autoPlay />
            }
            <div>
                <audio controls ref={audioRef}>
                    <source src={"file:///Users/kalebheinzen/Documents/Projects/cephable/facial-movement-electronforge/public/soundMouthOpen.mp3"} type="audio/mpeg" />
                </audio>
            </div>
        </div>
    )
}