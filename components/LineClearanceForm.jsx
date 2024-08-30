'use client';

import React, { useState } from 'react';

const LineClearanceForm = ({ initialData, batchId }) => {
    const [formData, setFormData] = useState({
        question1: initialData?.question1 || '',
        question2: initialData?.question2 || '',
        question3: initialData?.question3 || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement form submission logic
        console.log('Form submitted:', formData);
    };

    const questions = [
        "Is the production area clean and free from previous batch materials?",
        "Are all necessary equipment and materials available for the new batch?",
        "Has the production line been properly sanitized?"
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question, index) => (
                <div key={index} className="space-y-2">
                    <p className="font-medium text-gray-700">{question}</p>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name={`question${index + 1}`}
                                value="yes"
                                checked={formData[`question${index + 1}`] === 'yes'}
                                onChange={handleChange}
                                className="form-radio"
                            />
                            <span className="ml-2 text-gray-700">Yes</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name={`question${index + 1}`}
                                value="na"
                                checked={formData[`question${index + 1}`] === 'na'}
                                onChange={handleChange}
                                className="form-radio"
                            />
                            <span className="ml-2 text-gray-700">N/A</span>
                        </label>
                    </div>
                </div>
            ))}
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Submit
            </button>
        </form>
    );
};

export default LineClearanceForm;
