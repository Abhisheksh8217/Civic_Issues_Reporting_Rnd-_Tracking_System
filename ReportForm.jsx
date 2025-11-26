import { useState } from 'react';
import { motion } from 'framer-motion';

import Loader from './Loader';
import { issues } from '../utils/api';
import { generateImageHash } from '../utils/imageHashClient';


function ReportForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    latitude: '',
    longitude: '',
    address: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);

  const categories = [
    'pothole',
    'garbage',
    'streetlight',
    'water leakage',
    'drainage',
    'road damage',
    'other'
  ];

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setAnalyzing(true);
    setWarnings([]);

    try {
      // Generate image hash for duplicate detection
      const hash = await generateImageHash(file);
      setWarnings(prev => [...prev, `✓ Image analyzed for duplicate detection`]);
    } catch (err) {
      console.error('Image hash failed:', err);
    }

    setAnalyzing(false);
  };



  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          
          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=9df9744bf20841d5b44b1071c195c833`
            );
            const data = await response.json();
            const address = data.results[0]?.formatted || `${lat}, ${lng}`;
            
            setFormData({
              ...formData,
              latitude: lat,
              longitude: lng,
              address: address,
            });
          } catch (error) {
            setFormData({
              ...formData,
              latitude: lat,
              longitude: lng,
              address: `${lat}, ${lng}`,
            });
          }
        },
        (error) => {
          alert('Unable to get location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      setError('Please upload a photo');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Please provide location coordinates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      if (formData.address) {
        submitData.append('address', formData.address);
      }
      submitData.append('photo', photo);
      


      // Generate client-side hash
      try {
        const hash = await generateImageHash(photo);
        submitData.append('clientImageHash', hash);
      } catch (err) {
        console.error('Client hash generation failed:', err);
      }

      const response = await issues.create(submitData);

      if (response.data.isSpam) {
        alert('⚠️ SPAM WARNING\n\nYour account has been flagged for potential spam activity.');
      }

      alert('✅ Issue reported successfully! 🎉');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'pothole',
        latitude: '',
        longitude: '',
        address: '',
      });
      setPhoto(null);
      setPhotoPreview(null);
      setWarnings([]);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Submit error:', err);
      
      if (err.response?.data?.isDuplicate) {
        const details = err.response.data.duplicateDetails;
        alert(
          '🚫 DUPLICATE REPORT DETECTED!\n\n' +
          details.message + '\n\n' +
          'Original Issue: ' + details.originalIssueTitle + '\n' +
          'Reported on: ' + new Date(details.originalIssueDate).toLocaleDateString() + '\n\n' +
          'Your report was NOT submitted. Please check existing reports first.'
        );
        setError('Duplicate report detected. Submission blocked.');
      } else {
        const errorMsg = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to submit report';
        setError(errorMsg);
        alert('❌ Error: ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          
          {photoPreview && (
            <div className="mt-4">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
              
              {analyzing && (
                <div className="mt-4">
                  <Loader text="Analyzing image for duplicates..." />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analysis Status */}
        {warnings.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 mb-2">✓ Image Analysis:</p>
            {warnings.map((warning, idx) => (
              <p key={idx} className="text-sm text-green-700">{warning}</p>
            ))}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="e.g., Large pothole on Main Street"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            rows="4"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          {formData.address && (
            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">📍 {formData.address}</p>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Latitude"
              required
            />
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Longitude"
              required
            />
            <button
              type="button"
              onClick={getLocation}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-purple-600"
            >
              📍 Auto
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || analyzing}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </motion.div>
  );
}

export default ReportForm;
