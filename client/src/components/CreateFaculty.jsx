import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CreateFaculty = () => {
  const [form, setForm] = useState({
    reggNumber: '',
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    parentName: '',
    qualification: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.reggNumber.startsWith('P')) {
      toast.error('Registration number must start with P');
      return false;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (form.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/facultys/register", form);
      if (data.success) {
        toast.success(data.message || `Faculty created successfully! Name: ${form.name}`);
        setForm({
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
        toast.error(data.message || 'Failed to create faculty');
      }
    } catch (error) {
      console.error('Error creating faculty:', error);
      toast.error(error.response?.data?.message || 'Error creating faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: '600px', margin: 'auto' }}
      className='bg-green-100 px-15 py-10 rounded-xl shadow-2xl'
    >
      <h2 className='text-center text-3xl font-bold mb-5'>Create Faculty</h2>

      <Input 
        label="Registration Number" 
        name="reggNumber" 
        value={form.reggNumber} 
        onChange={handleChange}
        placeholder="P202401"
      />
      <Input 
        label="Name" 
        name="name" 
        value={form.name} 
        onChange={handleChange}
        placeholder="Full Name"
      />
      <Input 
        label="Email" 
        name="email" 
        value={form.email} 
        onChange={handleChange}
        type="email"
        placeholder="faculty@example.com"
      />
      <Input 
        label="Phone Number" 
        name="phoneNumber" 
        value={form.phoneNumber} 
        onChange={handleChange}
        placeholder="10-digit phone number"
      />
      <Input 
        label="Address" 
        name="address" 
        value={form.address} 
        onChange={handleChange}
        placeholder="Full Address"
      />
      <Input 
        label="Parent Name" 
        name="parentName" 
        value={form.parentName} 
        onChange={handleChange}
        placeholder="Parent/Guardian Name"
      />
      <Input 
        label="Qualification" 
        name="qualification" 
        value={form.qualification} 
        onChange={handleChange}
        placeholder="Educational Qualification"
      />
      <Input 
        label="Password" 
        name="password" 
        value={form.password} 
        onChange={handleChange}
        type="password"
        placeholder="At least 6 characters"
      />

      <button
        className='text-center ml-50 bg-blue-400 text-white font-semibold text-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed'
        type="submit"
        style={{ padding: '10px 20px' }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Submit'}
      </button>
    </form>
  );
};

const Input = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div style={{ marginBottom: '10px' }}>
    <label className='text-mg font-semibold block mb-1'>{label} :</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className='w-full border-1 h-10 rounded-md pl-5'
      required
      placeholder={placeholder}
    />
  </div>
);

export default CreateFaculty;
