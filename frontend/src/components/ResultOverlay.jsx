import React from 'react'
import { Loader } from './Loader'

const CircularProgressBar = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 10) * circumference;

    return (
        <svg width="120" height="120" className="transform -rotate-90">
            <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="gray"
                strokeWidth="10"
                fill="transparent"
            />
            <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="green"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
            />
        </svg>
    );
};

export const ResultOverlay = ({ isOpen, onClose, loading, setLoading, loadingMSG, scores }) => {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-gradient-to-b from-gray-900 via-black to-black z-50 flex justify-center">
                    <button className="absolute top-4 left-4 text-white text-2xl font-bold" onClick={onClose}>
                        &times;
                    </button>
                    <div className="flex flex-col justify-center items-center">
                        <Loader loading={loading} setLoading={setLoading} />
                        {loading && <div className="text-2xl font-bold text-white mt-32 ml-8">{loadingMSG} ...</div>}
                        {!loading && (
                            <div className="flex flex-col items-center gap-20">
                                <h1 className="text-5xl font-bold text-white">Results</h1>
                                <div className="flex flex-row items-center gap-10 justify-center ml-8">
                                    <div className="flex flex-col justify-center items-center">
                                        <p className="text-3xl font-bold text-white">Technical-Skills</p>
                                        <CircularProgressBar score={scores.tech} />
                                        <p className="text-3xl font-bold text-white">{scores.tech}/10</p>
                                    </div>
                                    <div className="flex flex-col justify-center items-center">
                                        <p className="text-3xl font-bold text-white">Communication-Skills</p>
                                        <CircularProgressBar score={scores.comm} />
                                        <p className="text-3xl font-bold text-white">{scores.comm}/10</p>
                                    </div>
                                    <div className="flex flex-col justify-center items-center">
                                        <p className="text-3xl font-bold text-white">Confidence Level</p>
                                        <CircularProgressBar score={scores.videoScore} />
                                        <p className="text-3xl font-bold text-white">{scores.videoScore}/10</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
