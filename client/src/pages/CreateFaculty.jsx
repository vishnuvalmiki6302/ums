import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CreateFaculty = () => {
    const [formData, setFormData] = useState({
        reggNumber: '',
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        parentName: '',
        qualification: '',
        password: '',
    });

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/facultys/register', formData);
            if (response.data.success) {
                toast.success(response.data.message);
                
                setFormData({
                    reggNumber: '',
                    name: '',
                    email: '',
                    phoneNumber: '',
                    address: '',
                    parentName: '',
                    qualification: '',
                    password: '',
                });
            } else {
                toast.error(response.data.message || 'Failed to create faculty');
            }
        } catch (error) {
            console.error('Error creating faculty:', error);
            toast.error(error.response?.data?.message || 'Failed to create faculty');
        }
    };

    return (
        <div>
            {/* Render your form here */}
        </div>
    );
};

export default CreateFaculty; 