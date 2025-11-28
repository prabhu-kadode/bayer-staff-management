import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shiftAPI } from "../services/api";

const CreateShift = () => {
  const [formData, setFormData] = useState({
    date: "",
    type: "Morning",
    capacity: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const shiftTypes = ["Morning", "Afternoon", "Night"];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Cannot create shifts in the past";
      }
    }

    if (!formData.type) {
      newErrors.type = "Shift type is required";
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required";
    } else if (parseInt(formData.capacity) < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    } else if (parseInt(formData.capacity) > 100) {
      newErrors.capacity = "Capacity cannot exceed 100";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await shiftAPI.createShift({
        date: formData.date,
        type: formData.type,
        capacity: parseInt(formData.capacity),
      });

      setSuccessMessage("Shift created successfully!");
      setTimeout(() => {
        navigate("/shifts");
      }, 1500);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || "Failed to create shift",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Create New Shift
      </h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shift Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Shift Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shift Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.type ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          >
            {shiftTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type}</p>
          )}
        </div>

        {/* Capacity Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff Capacity
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.capacity ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter number of staff needed"
            min="1"
            max="100"
            disabled={isSubmitting}
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Shift"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/shifts")}
            className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShift;
