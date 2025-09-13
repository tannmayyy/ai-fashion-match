import React, { useState, useCallback, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  onAuthObserver 
} from './services/firebaseService';
import { getUserCountry } from './services/locationService';

import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { ResultCard } from './components/ResultCard';
import { analyzeOutfit } from './services/geminiService';
import type { AnalysisResult } from './types';
import { AccessoryIcon, CaptionIcon, FootwearIcon, HairstyleIcon, OccasionIcon, StyleIcon, ShopIcon } from './components/IconComponents';
import { Toast } from './components/Toast';
import { Feedback } from './components/Feedback';

interface AuthPageProps {
  onDemoLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onDemoLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Demo user bypass
    if (isLoginView && email === 'test@gmail.com' && password === 'test@123') {
      onDemoLogin();
      setIsLoading(false);
      return;
    }
    
    try {
      if (isLoginView) {
        await signInUser(email, password);
      } else {
        if (!username.trim()) {
            setError("Please enter a username.");
            setIsLoading(false);
            return;
        }
        await signUpUser(email, password, username);
      }
    } catch (err: any) {
      // Make firebase errors more readable
      let errorMessage = err.message
        .replace('Firebase: ', '')
        .replace('Error ', '')
        .replace(/ \(auth\/.*\)\.?/, '');
       if (errorMessage.includes('user-not-found')) {
         errorMessage = "No user found with this email. Please sign up."
       } else if (errorMessage.includes('wrong-password')) {
         errorMessage = "Incorrect password. Please try again."
       }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
       <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
             </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            AI Fashion Match
          </h1>
        </div>
      <div className="relative max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10 transition-opacity duration-300">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-semibold text-gray-700">
                    {isLoginView ? 'Signing In...' : 'Creating Account...'}
                </p>
            </div>
        )}

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginView && (
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition" />
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-all duration-300 transform hover:scale-105">
            {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-semibold text-indigo-600 hover:underline">
            {isLoginView ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isIndia, setIsIndia] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23d1d5db' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z' /%3E%3C/svg%3E";

  const showToast = (message: string, type: 'info' | 'error' | 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const checkLocation = async () => {
      if (isIndia !== null) return;

      showToast("Checking your location to personalize results...", "info");
      try {
        const countryCode = await getUserCountry();
        if (countryCode === 'in') {
          setIsIndia(true);
          showToast("Location set to India. Showing local results.", "success");
        } else {
          setIsIndia(false);
          const message = countryCode ? `Location detected outside India. Showing global results.` : "Could not determine location. Showing global results.";
          showToast(message, "info");
        }
      } catch (error: any) {
        console.warn("Location check failed:", error.message);
        setIsIndia(false); // Default to global
        
        let statusMessage = "Could not determine location. Showing global results.";
        if (error.code) { // GeolocationPositionError
            switch (error.code) {
                case 1: // PERMISSION_DENIED
                    statusMessage = "Location access was denied. Showing global results.";
                    break;
                case 2: // POSITION_UNAVAILABLE
                    statusMessage = "Location is currently unavailable. Showing global results.";
                    break;
                case 3: // TIMEOUT
                    statusMessage = "Location request timed out. Showing global results.";
                    break;
            }
        } else if (error.message && error.message.toLowerCase().includes('secure context')) {
          statusMessage = "Location access requires a secure connection (HTTPS). Showing global results.";
        }
        showToast(statusMessage, "error");
      }
    };
    checkLocation();
  }, []);

  const handleFileChange = (file: File) => {
    setImageFile(file);
    setAnalysis(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile || !imagePreview) {
      setError("Please select an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const base64Data = imagePreview.split(',')[1];
      const result = await analyzeOutfit(base64Data, imageFile.type, isIndia ?? false);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imagePreview, isIndia]);
  
  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 antialiased">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {!imagePreview && (
            <div className="text-center transition-opacity duration-500">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Find Your Perfect Match</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Upload a photo of your outfit and let our AI stylist give you personalized fashion advice in seconds.</p>
              <FileUpload onFileSelect={handleFileChange} disabled={isLoading} />
            </div>
          )}

          {imagePreview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden border-4 border-white">
                  <img src={imagePreview} alt="Outfit preview" className="w-full h-auto object-cover" />
                </div>
                 {!isLoading && !analysis && (
                    <button onClick={handleAnalyzeClick} className="w-full max-w-md bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105">
                        Get Style Advice
                    </button>
                 )}
                <button onClick={handleReset} className="w-full max-w-md bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300">
                    Try a Different Outfit
                </button>
              </div>

              <div className="mt-8 md:mt-0">
                {isLoading && <Loader />}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                
                {analysis && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Style Analysis</h3>
                      <ResultCard icon={<StyleIcon />} title="Outfit Description" content={analysis.description} />
                      <ResultCard icon={<AccessoryIcon />} title="Accessory Suggestions" content={<ul>{analysis.accessories.map((item, i) => <li key={i} className="list-disc list-inside">{item}</li>)}</ul>} />
                      <ResultCard icon={<FootwearIcon />} title="Footwear Match" content={analysis.footwear} />
                      <ResultCard icon={<HairstyleIcon />} title="Hairstyle Idea" content={analysis.hairstyle} />
                      <ResultCard icon={<OccasionIcon />} title="Perfect For" content={analysis.occasion} />
                      <ResultCard icon={<CaptionIcon />} title="Instagram Caption" content={`"${analysis.caption}"`} />
                    </div>
                    
                    {analysis.styleSuggestions && analysis.styleSuggestions.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Style Breakdown</h3>
                        <div className="space-y-3">
                          {analysis.styleSuggestions.map((item, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800">{item.itemName}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <a href={`https://www.google.com/search?q=${encodeURIComponent(item.itemName)}&tbm=shop`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline mt-2 inline-block">
                                Find Online &rarr;
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <ShopIcon />
                          Shop This Look
                        </h3>
                        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
                            {analysis.recommendations.map((rec, i) => (
                                <a href={rec.buyLink} key={i} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-40 sm:w-44 block bg-white rounded-lg shadow border border-gray-200 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-indigo-300 transform hover:-translate-y-1">
                                    <div className="w-full aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                                      <img 
                                        src={rec.productImageURL} 
                                        alt={rec.productName} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => { e.currentTarget.src = placeholderImage; e.currentTarget.onerror = null; }}
                                       />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-xs font-semibold text-gray-800 truncate group-hover:text-indigo-600" title={rec.productName}>{rec.productName}</h4>
                                        <p className="text-sm font-bold text-gray-900 mt-1">{rec.price}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Feedback user={user} onFeedbackSubmitted={() => showToast('Thank you for your feedback!', 'success')} />
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthObserver((currentUser) => {
      // If demo user is active, don't let firebase override it.
      if (!isDemoUser) {
        setUser(currentUser);
      }
      setAuthLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isDemoUser]);

  const handleDemoLogin = () => {
    // Create a mock user object for the demo session
    const demoUser = {
      email: 'test@gmail.com',
      displayName: 'Demo User',
      // Add other necessary User properties to satisfy the type
      uid: 'demo-user',
    } as User;
    setUser(demoUser);
    setIsDemoUser(true);
    setAuthLoading(false);
  };
  
  const handleLogout = () => {
    if (isDemoUser) {
      // For demo user, just reset the state
      setUser(null);
      setIsDemoUser(false);
    } else {
      // For real user, sign out from Firebase
      signOutUser().catch(err => console.error("Logout failed", err));
      // The onAuthObserver will handle setting the user to null
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <HomePage user={user} onLogout={handleLogout} /> : <AuthPage onDemoLogin={handleDemoLogin} />;
};

export default App;