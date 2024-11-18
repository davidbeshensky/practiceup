'use client'

import React, {useEffect} from 'react';
import { useAudioAnalyzer } from './AudioContextProvider'

const TunerComponent: React.FC = () => {
    const { frequencyData, isRecording, toggleRecording } = useAudioAnalyzer();


    /*
     *so the idea here is that we take the frequency data and measure the amplitude of the target bin as well as adjacent bins.
     *if this is the case then we should be able to tell whether it is flat or sharp based on the ratio of these amplitudes.
     *when we have the ratio we can diagnose flat or sharp and define some parameters for which the ratio is 'good enough' 
     */
    
    useEffect(() => {
        if (frequencyData.length > 0) {
            //example lets check if there is a peak at 440 Hz (conert A);
            const sampleRate = 44100; 
            const frequencyPerBin = (sampleRate / 2) / frequencyData.length;

            const targetFrequency = 440; 
            const targetBin = Math.round(targetFrequency / frequencyPerBin);

            const amplitude = frequencyData[targetBin];

            if (amplitude > 0) {
                console.log(`frequency detected around 440hz with amplitude: ${amplitude}`)
            }
        }
    }, [frequencyData])

    return (
        <div>
            <button onClick={toggleRecording}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <p>{isRecording ? 'Listening...' : 'Not Listening'}</p>
        </div>
    );
};

export default TunerComponent;