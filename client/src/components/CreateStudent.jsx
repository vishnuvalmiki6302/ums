import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateStudent = () => {
  const [form, setForm] = useState({
    reggNumber: '',
    name: '',
    email: '',
    phoneNumber: '',
    course: '',
    parentName: '',
    parentNumber: '',
    section: '',
    password: '',
    photo_front: null,
    photo_left: null,
    photo_right: null,
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm({ ...form, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append all text fields except photos
    Object.keys(form).forEach(key => {
      if (
        key !== 'photo_front' &&
        key !== 'photo_left' &&
        key !== 'photo_right'
      ) {
        formData.append(key, form[key]);
      }
    });

    // Only append images if reggNumber starts with 'S'
    if (form.reggNumber?.startsWith('S')) {
      if (form.photo_front) formData.append('photo_front', form.photo_front);
      if (form.photo_left) formData.append('photo_left', form.photo_left);
      if (form.photo_right) formData.append('photo_right', form.photo_right);
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        // Show success toast from server response
        if (data.toast) {
          toast[data.toast.type](data.toast.message);
        } else {
          toast.success(`Student created successfully! Name: ${form.name}`);
        }
        
        // Reset form
        setForm({
          reggNumber: '',
          name: '',
          email: '',
          phoneNumber: '',
          course: '',
          parentName: '',
          parentNumber: '',
          section: '',
          password: '',
          photo_front: null,
          photo_left: null,
          photo_right: null,
        });
      } else {
        toast.error(data.message || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      // Show error toast from server response if available
      if (error.response?.data?.toast) {
        toast[error.response.data.toast.type](error.response.data.toast.message);
      } else {
        toast.error(error.response?.data?.message || 'Error creating student');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: '1000px', margin: 'auto' }}
      className="bg-green-100 px-15 py-10 rounded-xl shadow-2xl"
    >
      <h2 className="text-center text-3xl font-bold mb-5">Create Student</h2>

      <div className="flex justify-between">
        <div className="w-[45%]">
          <Input label="Registration Number" name="reggNumber" value={form.reggNumber} onChange={handleChange} />
          <Input label="Name" name="name" value={form.name} onChange={handleChange} />
          <Input label="Email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Course" name="course" value={form.course} onChange={handleChange} />
          <Input label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
          <Input label="Parent Name" name="parentName" value={form.parentName} onChange={handleChange} />
          <Input label="Parent Phone" name="parentNumber" value={form.parentNumber} onChange={handleChange} />
          <Input label="Section" name="section" value={form.section} onChange={handleChange} />
          <Input label="Password" name="password" value={form.password} onChange={handleChange} />
        </div>

        <div>
          <FileInput
            label="Front Photo"
            name="photo_front"
            file={form.photo_front}
            onChange={handleFileChange}
          />
          <FileInput
            label="Left Photo"
            name="photo_left"
            file={form.photo_left}
            onChange={handleFileChange}
          />
          <FileInput
            label="Right Photo"
            name="photo_right"
            file={form.photo_right}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <button
        className="text-center ml-50 bg-blue-400 text-white font-semibold text-xl rounded-xl"
        type="submit"
        style={{ padding: '10px 20px', marginLeft: '45%' }}
      >
        Submit
      </button>
    </form>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div style={{ marginBottom: '10px' }}>
    <label className="text-mg font-semibold block mb-1">{label} :</label>
    <input
      type={name === 'password' ? 'password' : 'text'}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border-t-3 border-1 h-10 rounded-md pl-5 shadow-xl"
      required
    />
  </div>
);

const FileInput = ({ label, name, file, onChange }) => {
  const filePreview = file ? URL.createObjectURL(file) : null;

  return (
    <div style={{ marginBottom: '15px' }}>
      <label className="text-mg font-semibold block mb-1">{label}:</label>
      <input
        type="file"
        name={name}
        accept="image/*"
        onChange={onChange}
        className="w-full border-1 h-10 rounded-md pl-2 pt-1 bg-white"
        required
      />
      {file && (
        <div className="mt-2">
          <img src={filePreview} alt={`${label} preview`} className="w-32 h-32 object-cover mt-2" />
        </div>
      )}
    </div>
  );
};

export default CreateStudent;
