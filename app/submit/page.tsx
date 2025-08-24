'use client';

import React, { useState } from 'react';
import { Send, Plus, X } from 'lucide-react';
import AdSlot from '@/components/ads/AdSlot';
import styles from './page.module.css';

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    toolName: '',
    website: '',
    category: '',
    description: '',
    pricing: '',
    features: [''],
    submitterName: '',
    submitterEmail: '',
    additionalInfo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Writing & Content',
    'Design & Creative',
    'Development',
    'Marketing',
    'Productivity',
    'Analytics',
    'Video & Media',
    'Audio',
    'Research',
    'Business',
    'Education',
    'Healthcare'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        features: newFeatures
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✅</div>
          <h1>Thank You!</h1>
          <p>
            Your AI tool submission has been received successfully. 
            Our team will review it and get back to you within 2-3 business days.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({
                toolName: '',
                website: '',
                category: '',
                description: '',
                pricing: '',
                features: [''],
                submitterName: '',
                submitterEmail: '',
                additionalInfo: ''
              });
            }}
            className={styles.submitAnother}
          >
            Submit Another Tool
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submit an AI Tool</h1>
        <p className={styles.subtitle}>
          Help the community discover amazing AI tools by submitting your favorites
        </p>
      </div>

      <AdSlot 
        slot="submit-top" 
        format="leaderboard"
        className={styles.adSlot}
      />

      <div className={styles.content}>
        <div className={styles.guidelines}>
          <h2>Submission Guidelines</h2>
          <ul>
            <li>The tool must be AI-powered or use machine learning</li>
            <li>Provide accurate and up-to-date information</li>
            <li>Include a clear description of what the tool does</li>
            <li>List key features that make the tool valuable</li>
            <li>Ensure the website URL is correct and accessible</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h3>Tool Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="toolName">Tool Name *</label>
              <input
                type="text"
                id="toolName"
                name="toolName"
                value={formData.toolName}
                onChange={handleInputChange}
                required
                className={styles.input}
                placeholder="Enter the AI tool name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="website">Website URL *</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                required
                className={styles.input}
                placeholder="https://example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={styles.select}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="pricing">Pricing Model *</label>
              <select
                id="pricing"
                name="pricing"
                value={formData.pricing}
                onChange={handleInputChange}
                required
                className={styles.select}
              >
                <option value="">Select pricing model</option>
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className={styles.textarea}
                placeholder="Describe what this AI tool does and its main benefits"
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Key Features *</label>
              {formData.features.map((feature, index) => (
                <div key={index} className={styles.featureInput}>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className={styles.input}
                    placeholder={`Feature ${index + 1}`}
                    required={index === 0}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className={styles.removeFeature}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className={styles.addFeature}
              >
                <Plus size={16} />
                Add Feature
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Your Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="submitterName">Your Name *</label>
              <input
                type="text"
                id="submitterName"
                name="submitterName"
                value={formData.submitterName}
                onChange={handleInputChange}
                required
                className={styles.input}
                placeholder="Enter your full name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="submitterEmail">Your Email *</label>
              <input
                type="email"
                id="submitterEmail"
                name="submitterEmail"
                value={formData.submitterEmail}
                onChange={handleInputChange}
                required
                className={styles.input}
                placeholder="your.email@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo">Additional Information</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Any additional information about the tool or your experience with it"
                rows={3}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Tool
              </>
            )}
          </button>
        </form>
      </div>

      <AdSlot 
        slot="submit-bottom" 
        format="leaderboard"
        className={styles.adSlot}
      />
    </div>
  );
}