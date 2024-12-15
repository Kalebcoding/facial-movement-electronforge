import React, { FC, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaceDetector, FilesetResolver, Detection, FaceLandmarker } from '@mediapipe/tasks-vision';
import { ConfidenceScore } from '../face-detection/confidence-score';
import { createPortal } from 'react-dom';

type Props = {
    mirror?: boolean;
}

export const WebcamComponent: FC<Props> = ({ mirror = true }) => {
    const [stream, setStream] = useState(null);
    const [faceLandmarker, setFaceLandmaker] = useState<FaceLandmarker>(null);
    const videoRef = useRef(null);
    const liveView = useRef(null);
    const children = useRef([]);



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
        console.log(`!!stream`, !!stream);
        if (stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", trackFace)
        }
    }, [stream])

    const trackFace = async () => {
        let lastVideoTime = -1;
        let startTimeMs = performance.now();
        if(videoRef.current.currentTime != lastVideoTime) {
            lastVideoTime = videoRef.current.currentTime; 
            const detections = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);
            console.log(`detections Object`, detections?.faceBlendshapes[0]?.categories[25])
            // displayVideoDetections(detections);
        }

        // Can check here to make sure the webcam is stil running to not spam the browser
        window.requestAnimationFrame(trackFace);
    }

    // This Function could be used to track or draw images ontop of the face 
    function displayVideoDetections(detections: Detection[]) {
        // Remove any highlighting from previous frame.
      
        console.log(`detections`, detections);
        for (let child of children.current) {
          liveView.current.removeChild(child);
        }
        children.current.splice(0);

        for (let detection of detections) {
            const confidenceScore = String(Math.round(parseFloat(String(detection.categories[0].score)) * 100))
            const p = <ConfidenceScore text={confidenceScore} /> 
            // Need to figure out how to render this in the view. 
            createPortal(p, document.body)
        }
      }

    return (
        <div id="live-view-container" ref={liveView}>
            {stream &&
                <StyledVideo ref={videoRef} autoPlay />
            }
            <button onClick={() => console.log('Detecting Faces...')}> Detect Faces </button>
        </div>
    )
}