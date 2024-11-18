'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AudioContextData {
    frequencyData: number[];
    isRecording: boolean;
    toggleRecording: () => void;
    fftsize: number;
}

const AudioAnalyzerContext = createContext<AudioContextData | undefined>(undefined);

export const AudioAnalyzerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [frequencyData, setFrequencyData] = useState<number[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const fftsize = 8192;

    const setupAudioContext = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            //resolution per bin = sampleRt/fftsize => 
            //default browser sample rate is 44100Hz
            //so increasing fft size reduces bin size and thus increases precision.
            //frequency for bin at 44100/8192 -> 5.38hz/bin => each bin is an array that 
            //represents a frequency range of approximately 5.38 Hz.
            analyser.fftSize = fftsize; // suitable for violin tuning any base 2 number

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            getFrequencyData();
        } catch (error) {
            console.error('Error setting up audio context:', error);
        }
    };

    const cleanupAudioContext = () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
            analyserRef.current = null;
        }
    };

    const getFrequencyData = () => {
        if (!analyserRef.current) return;


        /**
         * understanding the dataArray
         * Bin Index = Target Frequency / Frequency per bin
         * Ex. for 440Hz or a concert A Bin Index = 440/5.38 = 82
         * the value at index 82 will represent the amplitude of the signal around 440Hz
         * 
         * for tuning purposes the highest amplitude would likely appear in index 82 unless it were slightly off
         * in which case it would appear in a neighboring bin.
         * 
         * the exact value will likely fall between buckets in which case we can interpolate between neighboring bins to estimate the exact peak.
         * we can then determine if we are slightly sharp or flat from the relative amplitudes of the bins
         * 
         */
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setFrequencyData(Array.from(dataArray));

        animationFrameIdRef.current = requestAnimationFrame(getFrequencyData);
    };

    const toggleRecording = () => {
        if (isRecording) {
            cleanupAudioContext();
        } else {
            setupAudioContext();
        }
        setIsRecording((prev) => !prev);
    };

    useEffect(() => {
        return () => cleanupAudioContext();
    }, []);

    return (
        <AudioAnalyzerContext.Provider value={{ frequencyData, isRecording, toggleRecording, fftsize }}>
            {children}
        </AudioAnalyzerContext.Provider>
    );
};

//custom hook to use the AudioAnalyzerContext
export const useAudioAnalyzer = () => {
    const context = useContext(AudioAnalyzerContext);
    if (context === undefined) {
        throw new Error('useAudioAnalyzer must be used within an AudioAnalyzerProvider context')
    }
    return context;
}
