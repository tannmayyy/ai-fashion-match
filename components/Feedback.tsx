import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { FeedbackIcon } from './IconComponents';
import { submitFeedback } from '../services/firebaseService';

interface FeedbackProps {
  onFeedbackSubmitted: () => void;
  user: User;
}

export const Feedback: React.FC<FeedbackProps> = ({ onFeedbackSubmitted, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('inaccurate-analysis');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter your feedback before submitting.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      await submitFeedback(user.uid, user.email, feedbackType, message);
      
      // Reset state and close modal on success
      setIsSubmitting(false);
      setIsModalOpen(false);
      setMessage('');
      onFeedbackSubmitted();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Sorry, we couldn't submit your feedback. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) {
    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40"
        aria-label="Give feedback"
      >
        <FeedbackIcon />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close feedback form"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Share Your Feedback</h2>
        <p className="text-sm text-gray-600 mb-6">We'd love to hear your thoughts on how we can improve!</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 mb-1">Feedback Category</label>
            <select
              id="feedbackType"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
            >
              <option value="inaccurate-analysis">Inaccurate Analysis</option>
              <option value="bad-product-links">Bad Product Links</option>
              <option value="feature-suggestion">Feature Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell us more..."
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};