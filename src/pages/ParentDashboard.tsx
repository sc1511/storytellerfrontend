import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to convert technical errors to user-friendly messages
const getUserFriendlyError = (err: any, defaultMessage: string = 'Er ging iets mis'): string => {
  // Log technical details to console (for debugging) but don't show to user
  console.error('Technical error details:', {
    code: err?.code,
    message: err?.message,
    status: err?.response?.status,
    statusText: err?.response?.statusText,
    url: err?.config?.url,
  });

  // Network/connection errors
  if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error') || !err?.response) {
    return 'Kan niet verbinden met de server. Probeer het later opnieuw.';
  }

  // CORS errors (don't show technical details)
  if (err?.response?.status === 0) {
    return 'Verbindingsprobleem. Probeer het later opnieuw.';
  }

  // HTTP status codes - friendly messages
  if (err?.response?.status === 401) {
    return 'Je bent niet ingelogd. Log opnieuw in.';
  }
  if (err?.response?.status === 403) {
    return 'Je hebt geen toegang tot deze informatie.';
  }
  if (err?.response?.status === 404) {
    return 'Niet gevonden. Controleer of alles correct is ingevuld.';
  }
  if (err?.response?.status === 500) {
    return 'Server probleem. Probeer het later opnieuw.';
  }

  // Backend error messages (if they're user-friendly)
  if (err?.response?.data?.message) {
    const backendMessage = err.response.data.message;
    // Filter out technical messages
    if (backendMessage.includes('CORS') || 
        backendMessage.includes('ERR_') || 
        backendMessage.includes('http://') || 
        backendMessage.includes('https://') ||
        backendMessage.includes('localhost')) {
      return defaultMessage;
    }
    return backendMessage;
  }

  if (err?.response?.data?.error) {
    const backendError = err.response.data.error;
    // Filter out technical messages
    if (backendError.includes('CORS') || 
        backendError.includes('ERR_') || 
        backendError.includes('http://') || 
        backendError.includes('https://')) {
      return defaultMessage;
    }
    return backendError;
  }

  // Generic error messages - filter technical ones
  if (err?.message) {
    const msg = err.message;
    if (msg.includes('CORS') || 
        msg.includes('ERR_') || 
        msg.includes('Network Error') ||
        msg.includes('timeout') ||
        msg.includes('http://') || 
        msg.includes('https://') ||
        msg.includes('localhost')) {
      return defaultMessage;
    }
    return msg;
  }

  return defaultMessage;
};

interface Child {
  id: string;
  name: string;
  age: string | null;
  language: string;
  verification_code: string;
  created_at: string;
}

export default function ParentDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('parent_token'));
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('6-8');
  const [sendingReport, setSendingReport] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set());
  const [storiesDropdownOpen, setStoriesDropdownOpen] = useState(true);
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set());
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchChildren();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/parent/login`, {
        email,
        password,
      });

      const newToken = response.data.data.token;
      setToken(newToken);
      localStorage.setItem('parent_token', newToken);
      setIsLoggedIn(true);
      fetchChildren();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'Login mislukt. Controleer je email en wachtwoord.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Registering with API URL:', API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/auth/parent/register`, {
        email,
        password,
      });

      console.log('Registration response:', response.data);
      
      if (!response.data?.data?.token) {
        throw new Error('No token received from server');
      }

      const newToken = response.data.data.token;
      setToken(newToken);
      localStorage.setItem('parent_token', newToken);
      setIsLoggedIn(true);
      fetchChildren();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'Registratie mislukt. Probeer het opnieuw of gebruik een ander email adres.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/parent/children`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChildren(response.data.data || []);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'Kon je kinderen niet ophalen. Probeer het later opnieuw.'));
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE_URL}/auth/parent/children`,
        {
          name: newChildName,
          age: newChildAge,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewChildName('');
      setNewChildAge('6-8');
      setShowAddChild(false);
      fetchChildren();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'Kon het kind niet toevoegen. Controleer of alle velden correct zijn ingevuld.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('parent_token');
    setIsLoggedIn(false);
    setChildren([]);
  };

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (!token) return;
    
    if (!window.confirm(`Weet je zeker dat je ${childName} wilt verwijderen? Dit kan niet ongedaan worden gemaakt!`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/auth/parent/children/${childId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchChildren(); // Refresh list
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'Kon het kind niet verwijderen. Probeer het later opnieuw.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (sessionIds: string[]) => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Delete all selected stories
      await Promise.all(
        sessionIds.map(sessionId =>
          axios.delete(`${API_BASE_URL}/auth/parent/story/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      
      // Clear selection
      setSelectedStories(new Set());
      
      // Refresh report data
      if (reportData?.childProfileId) {
        await handleRequestReport(reportData.childProfileId, reportData.childName || '');
      }
    } catch (err: any) {
      alert(getUserFriendlyError(err, 'Kon de verhalen niet verwijderen. Probeer het later opnieuw.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReport = async (childId: string, childName: string) => {
    if (!token) return;

    setSendingReport(childId);
    setError(null);
    setReportSuccess(null);

    try {
      console.log('📊 Requesting report for child:', childId);
      const response = await axios.post(
        `${API_BASE_URL}/auth/parent/report/${childId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('📊 Report response:', response.data);
      if (response.data.success && response.data.data) {
        console.log('📊 Stories in response:', response.data.data.stories);
        console.log('📊 First story:', response.data.data.stories?.[0]);
        setReportData(response.data.data);
        setShowReportModal(true);
      } else {
        setError('Geen rapport data ontvangen');
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'Kon het rapport niet ophalen. Probeer het later opnieuw.'));
    } finally {
      setSendingReport(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
          {/* Placeholder styling - zwart */}
          <style>{`
            input::placeholder,
            select::placeholder {
              color: #000000 !important;
              opacity: 0.5 !important;
            }
          `}</style>
          <h1 className="text-3xl font-bold text-center mb-6" style={{ color: '#667eea' }}>
            Ouder Dashboard
          </h1>

          <form onSubmit={handleLogin} className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="jouw@email.com"
                style={{
                  color: '#000000',
                  borderColor: '#cccccc',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="••••••••"
                style={{
                  color: '#000000',
                  borderColor: '#cccccc',
                }}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            {reportSuccess && (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm mb-4">
                {reportSuccess}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#FFFFFF',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Laden...' : 'Inloggen'}
            </button>
          </form>

          <div className="text-center text-sm mb-4" style={{ color: '#666666' }}>of</div>

          <form onSubmit={handleRegister} className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold border-2 transition-all"
              style={{
                borderColor: '#667eea',
                color: '#667eea',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Nieuw account aanmaken
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold" style={{ color: '#667eea' }}>
              Ouder Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}
            >
              Uitloggen
            </button>
          </div>
        </div>

        {/* Add Child Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <button
            onClick={() => setShowAddChild(!showAddChild)}
            className="w-full py-3 rounded-lg font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {showAddChild ? '✕ Annuleren' : '+ Kind Toevoegen'}
          </button>

          {showAddChild && (
            <form onSubmit={handleAddChild} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Naam</label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg"
                  placeholder="Naam van je kind"
                  style={{
                    color: '#000000',
                    borderColor: '#cccccc',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Leeftijd</label>
                <select
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  style={{
                    color: '#000000',
                    borderColor: '#cccccc',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="4-6">4-6 jaar</option>
                  <option value="6-8">6-8 jaar</option>
                  <option value="8-10">8-10 jaar</option>
                  <option value="10-12">10-12 jaar</option>
                </select>
              </div>
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Toevoegen...' : 'Kind Toevoegen'}
              </button>
            </form>
          )}
        </div>

        {/* Children List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#667eea' }}>
            Mijn Kinderen ({children.length})
          </h2>

          {children.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nog geen kinderen toegevoegd. Voeg een kind toe om te beginnen!
            </p>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 border-2 rounded-xl"
                  style={{
                    borderColor: '#667eea',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#667eea' }}>
                        {child.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Leeftijd: {child.age || 'Niet opgegeven'}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Taal: {child.language === 'nl' ? 'Nederlands' : 'English'}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRequestReport(child.id, child.name)}
                          disabled={loading || sendingReport === child.id}
                          className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          }}
                        >
                          {sendingReport === child.id ? 'Verzenden...' : '📧 Rapport Opvragen'}
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id, child.name)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                          }}
                        >
                          {loading ? 'Verwijderen...' : 'Verwijderen'}
                        </button>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">Verificatie Code:</p>
                        {visibleCodes.has(child.id) ? (
                          <div className="p-3 rounded-lg font-mono font-bold text-lg"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              letterSpacing: '0.2em',
                            }}
                          >
                            {child.verification_code}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const newVisible = new Set(visibleCodes);
                              newVisible.add(child.id);
                              setVisibleCodes(newVisible);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                          >
                            🔒 Code Tonen
                          </button>
                        )}
                        {visibleCodes.has(child.id) && (
                          <button
                            onClick={() => {
                              const newVisible = new Set(visibleCodes);
                              newVisible.delete(child.id);
                              setVisibleCodes(newVisible);
                            }}
                            className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                          >
                            Verbergen
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Aangemaakt: {new Date(child.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && reportData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">📚 Rapport: {reportData.childName}</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Overzicht van de afgelopen 7 dagen
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Statistics */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#667eea' }}>📊 Statistieken</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-3xl font-bold" style={{ color: '#667eea' }}>
                      {reportData.statistics.totalStories}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">Verhalen gelezen</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-3xl font-bold" style={{ color: '#764ba2' }}>
                      {reportData.statistics.totalSegments}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">Verhaalsegmenten</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="text-3xl font-bold" style={{ color: '#4caf50' }}>
                      {reportData.statistics.totalTests}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">Begripstests</div>
                  </div>
                  {reportData.statistics.avgTestScore && (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                      <div className="text-3xl font-bold" style={{ color: '#ff9800' }}>
                        {reportData.statistics.avgTestScore}%
                      </div>
                      <div className="text-gray-600 text-sm mt-1">Gem. testscore</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vocabulary */}
              {reportData.vocabulary && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#667eea' }}>📈 Taal & Vocabulaire</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {reportData.vocabulary.totalWords && reportData.vocabulary.totalWords > 0 && (
                      <div className="bg-white border-2 border-blue-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#667eea' }}>
                          {reportData.vocabulary.totalWords}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Totaal woorden</div>
                      </div>
                    )}
                    {reportData.vocabulary.totalUniqueWords && reportData.vocabulary.totalUniqueWords > 0 && (
                      <div className="bg-white border-2 border-purple-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#764ba2' }}>
                          {reportData.vocabulary.totalUniqueWords}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Unieke woorden</div>
                      </div>
                    )}
                    {reportData.vocabulary.avgDiversityScore && (
                      <div className="bg-white border-2 border-green-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#4caf50' }}>
                          {reportData.vocabulary.avgDiversityScore}%
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Vocabulaire diversiteit</div>
                      </div>
                    )}
                    {reportData.vocabulary.mostCommonReadingLevel && (
                      <div className="bg-white border-2 border-yellow-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#ff9800' }}>
                          {reportData.vocabulary.mostCommonReadingLevel}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Leesniveau</div>
                      </div>
                    )}
                  </div>
                  {reportData.vocabulary.uniqueAdvancedVocab && reportData.vocabulary.uniqueAdvancedVocab.length > 0 && (() => {
                    // List of placeholder/test words to filter out
                    const placeholderWords = [
                      'placeholder', 'test', 'example', 'sample', 'dummy', 'lorem', 'ipsum',
                      'demo', 'temporary', 'temp', 'xxx', 'yyy', 'zzz', 'abc', '123',
                      'voorbeeld', 'testwoord', 'placeholderwoord', 'demo', 'voorbeeldwoord'
                    ];
                    
                    // Extract words from array - handle both strings and objects
                    const words = reportData.vocabulary.uniqueAdvancedVocab
                      .map((w: any) => {
                        if (typeof w === 'string') {
                          return w;
                        } else if (w && typeof w === 'object') {
                          // Handle object with 'word' property
                          if ('word' in w && typeof w.word === 'string') {
                            return w.word;
                          }
                          // Try to stringify if it's a complex object
                          return null;
                        }
                        return null;
                      })
                      .filter((w: any) => {
                        // Filter out null/undefined and placeholder words
                        if (!w || typeof w !== 'string') return false;
                        const lowerWord = w.toLowerCase().trim();
                        return lowerWord.length > 0 && !placeholderWords.includes(lowerWord);
                      })
                      .slice(0, 10);
                    
                    // Also get definitions if available
                    const vocabWithDefinitions = reportData.vocabulary.uniqueAdvancedVocab
                      .filter((w: any) => {
                        if (typeof w === 'string') return true;
                        if (w && typeof w === 'object' && 'word' in w) {
                          const word = w.word?.toLowerCase().trim() || '';
                          return word.length > 0 && !placeholderWords.includes(word);
                        }
                        return false;
                      })
                      .slice(0, 10);
                    
                    return vocabWithDefinitions.length > 0 ? (
                      <div className="mt-4 bg-white border-2 border-blue-200 p-4 rounded-lg">
                        <div className="font-bold mb-2" style={{ color: '#667eea' }}>
                          Nieuwe moeilijke woorden ({vocabWithDefinitions.length})
                        </div>
                        <div className="space-y-2">
                          {vocabWithDefinitions.map((item: any, idx: number) => {
                            if (typeof item === 'string') {
                              return (
                                <div key={idx} className="text-sm" style={{ color: '#333333' }}>
                                  <strong>{item}</strong>
                                </div>
                              );
                            } else if (item && typeof item === 'object' && 'word' in item) {
                              return (
                                <div key={idx} className="text-sm" style={{ color: '#333333' }}>
                                  <strong>{item.word}</strong>
                                  {item.definition && (
                                    <span className="text-gray-600 ml-2">- {item.definition}</span>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Creativity */}
              {reportData.creativity && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#667eea' }}>🎨 Creativiteit</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {reportData.creativity.avgOriginalityScore && (
                      <div className="bg-white border-2 border-pink-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#e91e63' }}>
                          {reportData.creativity.avgOriginalityScore}%
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Originaliteit score</div>
                      </div>
                    )}
                    {reportData.creativity.avgCharacterDepth && (
                      <div className="bg-white border-2 border-purple-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#764ba2' }}>
                          {reportData.creativity.avgCharacterDepth}/10
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Karakter ontwikkeling</div>
                      </div>
                    )}
                    {reportData.creativity.avgSensoryLanguage && (
                      <div className="bg-white border-2 border-orange-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#ff9800' }}>
                          {reportData.creativity.avgSensoryLanguage}%
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Zintuiglijke taal</div>
                      </div>
                    )}
                    {reportData.creativity.uniqueEducationalThemes && reportData.creativity.uniqueEducationalThemes.length > 0 && (
                      <div className="bg-white border-2 border-green-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: '#4caf50' }}>
                          {reportData.creativity.uniqueEducationalThemes.length}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">Educatieve thema's</div>
                      </div>
                    )}
                  </div>
                  {reportData.creativity.plotComplexityDistribution && (
                    <div className="mt-4 bg-white border-2 border-indigo-200 p-4 rounded-lg">
                      <div className="font-bold mb-2" style={{ color: '#667eea' }}>
                        Plot Complexiteit
                      </div>
                      <div className="text-gray-600 text-sm space-y-1">
                        {Object.entries(reportData.creativity.plotComplexityDistribution).map(([complexity, count]: [string, any]) => (
                          <div key={complexity}>
                            <strong>{complexity}</strong>: {count} {count === 1 ? 'verhaal' : 'verhalen'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reportData.creativity.imaginativeElements && reportData.creativity.imaginativeElements.length > 0 && (
                    <div className="mt-4 bg-white border-2 border-pink-200 p-4 rounded-lg">
                      <div className="font-bold mb-2" style={{ color: '#e91e63' }}>
                        Creatieve Elementen ({reportData.creativity.imaginativeElements.length})
                      </div>
                      <div className="text-gray-600 text-sm">
                        {reportData.creativity.imaginativeElements.join(', ')}
                      </div>
                    </div>
                  )}
                  {reportData.creativity.uniqueEducationalThemes && reportData.creativity.uniqueEducationalThemes.length > 0 && (
                    <div className="mt-4 bg-white border-2 border-green-200 p-4 rounded-lg">
                      <div className="font-bold mb-2" style={{ color: '#4caf50' }}>
                        Thema's ({reportData.creativity.uniqueEducationalThemes.length})
                      </div>
                      <div className="text-gray-600 text-sm">
                        {reportData.creativity.uniqueEducationalThemes.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stories with Test Results */}
              {reportData.stories && reportData.stories.length > 0 && (
                <div className="mb-6">
                  {/* Dropdown Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg mb-3 transition-all hover:bg-gray-50"
                    onClick={() => setStoriesDropdownOpen(!storiesDropdownOpen)}
                    style={{
                      background: storiesDropdownOpen ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f7fa',
                      color: storiesDropdownOpen ? '#ffffff' : '#667eea',
                    }}
                  >
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <span>{storiesDropdownOpen ? '▼' : '▶'}</span>
                      <span>📖 Verhalen van deze week ({reportData.stories.length})</span>
                    </h3>
                    {selectedStories.size > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const sessionIds = Array.from(selectedStories);
                          if (window.confirm(`Weet je zeker dat je ${sessionIds.length} verhaal(en) wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
                            handleBulkDelete(sessionIds);
                          }
                        }}
                        className="px-3 py-1 text-sm rounded-lg font-bold transition-all hover:scale-105"
                        style={{
                          background: '#f44336',
                          color: '#ffffff',
                        }}
                      >
                        Verwijder ({selectedStories.size})
                      </button>
                    )}
                  </div>
                  
                  {storiesDropdownOpen && (
                  <div className="flex flex-col gap-3">
                    {reportData.stories.map((story: any, idx: number) => {
                      // Calculate average test score for this story using BEST scores per segment
                      let avgScore = null;
                      if (story.testResults && story.testResults.length > 0) {
                        // Group by segment and get best score per segment
                        const segmentMap = new Map<number, any>();
                        story.testResults.forEach((test: any) => {
                          const segmentSeq = test.segmentSequence || test.segment_sequence || 1;
                          const existing = segmentMap.get(segmentSeq);
                          if (!existing || test.percentageScore > existing.percentageScore) {
                            segmentMap.set(segmentSeq, test);
                          }
                        });
                        // Calculate average from best scores only
                        const bestScores = Array.from(segmentMap.values());
                        if (bestScores.length > 0) {
                          avgScore = Math.round(bestScores.reduce((sum: number, t: any) => sum + t.percentageScore, 0) / bestScores.length);
                        }
                      }
                      
                      const sessionId = story.session_id || story.sessionId;
                      const isSelected = selectedStories.has(sessionId);
                      
                      // Get incorrect answers for this story's segments
                      // Match by session_id and segment_sequence from test results
                      const getIncorrectAnswersForSegment = (segmentSeq: number, testResult: any) => {
                        if (!reportData.incorrectAnswers || !reportData.incorrectAnswers.length) return [];
                        
                        // Match by session_id and segment_sequence
                        const matched = reportData.incorrectAnswers.filter((item: any) => {
                          // Match session_id (must match this story's session)
                          const sessionMatch = (item.session_id === sessionId || item.sessionId === sessionId);
                          
                          // Match segment_sequence (must match this segment)
                          const segmentMatch = (item.segment_sequence === segmentSeq || 
                                               item.segmentSequence === segmentSeq ||
                                               item.segment_sequence === testResult?.segment_sequence ||
                                               item.segmentSequence === testResult?.segmentSequence);
                          
                          // Both must match
                          return sessionMatch && segmentMatch;
                        });
                        
                        return matched;
                      };
                      
                      return (
                        <div
                          key={sessionId || idx}
                          className="p-3 rounded-lg transition-all"
                          style={{
                            background: story.isCompleted
                              ? 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)'
                              : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                            border: `2px solid ${story.isCompleted ? '#00bcd4' : '#9c27b0'}`,
                            boxShadow: story.isCompleted
                              ? '0 0 15px rgba(0, 188, 212, 0.2)'
                              : '0 0 15px rgba(156, 39, 176, 0.2)',
                          }}
                        >
                          {/* Horizontal Row Layout - Compact */}
                          <div className="flex items-center justify-between gap-3">
                            {/* Left: Checkbox + Story Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedStories);
                                  if (e.target.checked) {
                                    newSelected.add(sessionId);
                                  } else {
                                    newSelected.delete(sessionId);
                                  }
                                  setSelectedStories(newSelected);
                                }}
                                className="w-4 h-4 cursor-pointer flex-shrink-0"
                                style={{ accentColor: '#667eea' }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3
                                    className="text-base font-bold truncate"
                                    style={{
                                      color: story.isCompleted ? '#006064' : '#4a148c',
                                      fontFamily: "'Poppins', sans-serif",
                                    }}
                                  >
                                    {story.character} verhaal
                                  </h3>
                                  {story.isCompleted && (
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                                      style={{
                                        background: '#00bcd4',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                      }}
                                    >
                                      ✓
                                    </span>
                                  )}
                                  <span className="text-xs" style={{ 
                                    color: '#666666',
                                    fontFamily: "'Poppins', sans-serif",
                                  }}>
                                    📅 {new Date(story.date || story.created_at).toLocaleDateString('nl-NL')}
                                  </span>
                                  <span className="text-xs" style={{ 
                                    color: '#666666',
                                    fontFamily: "'Poppins', sans-serif",
                                  }}>
                                    📖 {story.segmentCount} {story.segmentCount === 1 ? 'seg' : 'segs'}
                                  </span>
                                  {(story.metadata?.age || story.age) && (
                                    <span className="text-xs" style={{ 
                                      color: '#666666',
                                      fontFamily: "'Poppins', sans-serif",
                                    }}>
                                      👶 {story.metadata?.age || story.age}
                                    </span>
                                  )}
                                  {avgScore !== null && (
                                    <span 
                                      className="text-xs px-2 py-0.5 rounded"
                                      style={{ 
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: 700,
                                        background: story.isCompleted ? '#00bcd4' : '#9c27b0',
                                        color: '#ffffff',
                                      }}
                                    >
                                      ⭐ {avgScore}%
                                    </span>
                                  )}
                                </div>
                                
                                {/* Story Metrics - Rich Content */}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex flex-wrap gap-3 text-xs">
                                    {/* Originality Score */}
                                    {story.metadata?.creativity_metrics?.originality_score && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                                        background: 'rgba(233, 30, 99, 0.1)',
                                        border: '1px solid rgba(233, 30, 99, 0.3)',
                                      }}>
                                        <span style={{ color: '#e91e63', fontWeight: 600 }}>🎨</span>
                                        <span style={{ color: '#666666' }}>
                                          {Math.round(story.metadata.creativity_metrics.originality_score)}% Originaliteit
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Sensory Language */}
                                    {(story.metadata?.creativity_metrics?.sensory_language_percentage || 
                                      story.metadata?.creativity_metrics?.sensory_language_density) && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                                        background: 'rgba(255, 152, 0, 0.1)',
                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                      }}>
                                        <span style={{ color: '#ff9800', fontWeight: 600 }}>👁️</span>
                                        <span style={{ color: '#666666' }}>
                                          {Math.round(story.metadata.creativity_metrics.sensory_language_percentage || 
                                                    story.metadata.creativity_metrics.sensory_language_density || 0)}% Zintuiglijk
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Educational Themes */}
                                    {story.metadata?.educational_themes && 
                                     Array.isArray(story.metadata.educational_themes) && 
                                     story.metadata.educational_themes.length > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                                        background: 'rgba(76, 175, 80, 0.1)',
                                        border: '1px solid rgba(76, 175, 80, 0.3)',
                                      }}>
                                        <span style={{ color: '#4caf50', fontWeight: 600 }}>📚</span>
                                        <span style={{ color: '#666666' }}>
                                          {story.metadata.educational_themes.length} {story.metadata.educational_themes.length === 1 ? 'thema' : 'thema\'s'}
                                        </span>
                                        <span className="ml-1" style={{ color: '#999999', fontSize: '10px' }}>
                                          ({story.metadata.educational_themes.slice(0, 2).join(', ')}{story.metadata.educational_themes.length > 2 ? '...' : ''})
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Imaginative Elements */}
                                    {story.metadata?.creativity_metrics?.imaginative_elements && 
                                     Array.isArray(story.metadata.creativity_metrics.imaginative_elements) && 
                                     story.metadata.creativity_metrics.imaginative_elements.length > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                                        background: 'rgba(156, 39, 176, 0.1)',
                                        border: '1px solid rgba(156, 39, 176, 0.3)',
                                      }}>
                                        <span style={{ color: '#9c27b0', fontWeight: 600 }}>✨</span>
                                        <span style={{ color: '#666666' }}>
                                          {story.metadata.creativity_metrics.imaginative_elements.length} {story.metadata.creativity_metrics.imaginative_elements.length === 1 ? 'element' : 'elementen'}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Character Development */}
                                    {story.metadata?.creativity_metrics?.character_development_depth && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                                        background: 'rgba(118, 75, 162, 0.1)',
                                        border: '1px solid rgba(118, 75, 162, 0.3)',
                                      }}>
                                        <span style={{ color: '#764ba2', fontWeight: 600 }}>👤</span>
                                        <span style={{ color: '#666666' }}>
                                          {story.metadata.creativity_metrics.character_development_depth}/10 Karakter
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Plot Complexity */}
                                    {story.metadata?.creativity_metrics?.plot_complexity && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                      }}>
                                        <span style={{ color: '#667eea', fontWeight: 600 }}>📖</span>
                                        <span style={{ color: '#666666', textTransform: 'capitalize' }}>
                                          {story.metadata.creativity_metrics.plot_complexity}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Advanced Vocabulary Count */}
                                    {story.metadata?.vocabulary_metrics?.advanced_vocabulary && 
                                     Array.isArray(story.metadata.vocabulary_metrics.advanced_vocabulary) && 
                                     story.metadata.vocabulary_metrics.advanced_vocabulary.length > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                                        background: 'rgba(33, 150, 243, 0.1)',
                                        border: '1px solid rgba(33, 150, 243, 0.3)',
                                      }}>
                                        <span style={{ color: '#2196f3', fontWeight: 600 }}>📝</span>
                                        <span style={{ color: '#666666' }}>
                                          {story.metadata.vocabulary_metrics.advanced_vocabulary.length} {story.metadata.vocabulary_metrics.advanced_vocabulary.length === 1 ? 'woord' : 'woorden'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Full Educational Themes List (if available) */}
                                  {story.metadata?.educational_themes && 
                                   Array.isArray(story.metadata.educational_themes) && 
                                   story.metadata.educational_themes.length > 0 && (
                                    <div className="mt-2 text-xs" style={{ color: '#666666' }}>
                                      <span className="font-semibold" style={{ color: '#4caf50' }}>Thema's: </span>
                                      <span>{story.metadata.educational_themes.join(', ')}</span>
                                    </div>
                                  )}
                                  
                                  {/* Full Imaginative Elements List (if available) */}
                                  {story.metadata?.creativity_metrics?.imaginative_elements && 
                                   Array.isArray(story.metadata.creativity_metrics.imaginative_elements) && 
                                   story.metadata.creativity_metrics.imaginative_elements.length > 0 && (
                                    <div className="mt-1 text-xs" style={{ color: '#666666' }}>
                                      <span className="font-semibold" style={{ color: '#9c27b0' }}>Elementen: </span>
                                      <span>{story.metadata.creativity_metrics.imaginative_elements.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: Small Delete Button */}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!window.confirm('Weet je zeker dat je dit verhaal wilt verwijderen?')) {
                                  return;
                                }
                                try {
                                  await axios.delete(
                                    `${API_BASE_URL}/auth/parent/story/${sessionId}`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    }
                                  );
                                  // Refresh report data
                                  if (reportData?.childProfileId) {
                                    handleRequestReport(reportData.childProfileId, reportData.childName || '');
                                  }
                                  } catch (err: any) {
                                    alert(getUserFriendlyError(err, 'Kon het verhaal niet verwijderen. Probeer het later opnieuw.'));
                                  }
                              }}
                              className="px-2 py-1 text-xs rounded transition-all hover:bg-red-100"
                              style={{
                                background: '#f5f5f5',
                                color: '#d32f2f',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: '1px solid #d32f2f',
                              }}
                              title="Verhaal verwijderen"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Test Results - Clickable Segments with Incorrect Answers */}
                          {story.testResults && story.testResults.length > 0 && (
                            <div className="mt-2 pt-2 border-t" style={{ borderColor: story.isCompleted ? '#00bcd4' : '#9c27b0' }}>
                              <div className="text-xs font-bold mb-2" style={{ 
                                color: '#000000',
                                fontFamily: "'Poppins', sans-serif",
                              }}>
                                Test Scores (klik op segment voor details):
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  // Group tests by segment sequence and keep only the highest score for each segment
                                  const segmentMap = new Map<number, any>();
                                  
                                  story.testResults.forEach((test: any) => {
                                    const segmentSeq = test.segmentSequence || test.segment_sequence || 1;
                                    const existing = segmentMap.get(segmentSeq);
                                    
                                    // Keep the test with the highest score (or percentage score)
                                    if (!existing || test.percentageScore > existing.percentageScore) {
                                      segmentMap.set(segmentSeq, test);
                                    }
                                  });
                                  
                                  // Convert to array and sort by segment sequence
                                  const bestScores = Array.from(segmentMap.values())
                                    .sort((a, b) => (a.segmentSequence || a.segment_sequence || 1) - (b.segmentSequence || b.segment_sequence || 1));
                                  
                                  return bestScores.map((test: any, testIdx: number) => {
                                    const segmentSeq = test.segmentSequence || test.segment_sequence || 1;
                                    const segmentKey = `${sessionId}-segment-${segmentSeq}`;
                                    const isExpanded = expandedSegments.has(segmentKey);
                                    const incorrectAnswers = getIncorrectAnswersForSegment(segmentSeq, test);
                                    
                                    return (
                                      <div key={test.id || `segment-${segmentSeq}-${testIdx}`} className="w-full">
                                        <div
                                          onClick={() => {
                                            const newExpanded = new Set(expandedSegments);
                                            if (isExpanded) {
                                              newExpanded.delete(segmentKey);
                                            } else {
                                              newExpanded.add(segmentKey);
                                            }
                                            setExpandedSegments(newExpanded);
                                          }}
                                          className="px-3 py-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
                                          style={{
                                            background: test.percentageScore >= 67 
                                              ? 'rgba(76, 175, 80, 0.3)' 
                                              : test.percentageScore >= 33 
                                              ? 'rgba(255, 152, 0, 0.3)' 
                                              : 'rgba(244, 67, 54, 0.3)',
                                            border: `2px solid ${
                                              test.percentageScore >= 67 
                                                ? '#4caf50' 
                                                : test.percentageScore >= 33 
                                                ? '#ff9800' 
                                                : '#f44336'
                                            }`,
                                          }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                                              <span className="text-xs font-bold" style={{ color: '#000000' }}>
                                                Segment {segmentSeq}:
                                              </span>
                                              <span className="text-xs font-bold" style={{ 
                                                color: test.percentageScore >= 67 
                                                  ? '#4caf50' 
                                                  : test.percentageScore >= 33 
                                                  ? '#ff9800' 
                                                  : '#f44336',
                                              }}>
                                                {test.correctAnswers}/{test.totalQuestions} ({test.percentageScore}%)
                                              </span>
                                            </div>
                                            {incorrectAnswers.length > 0 && (
                                              <span className="text-xs px-1.5 py-0.5 rounded" style={{
                                                background: '#ff9800',
                                                color: '#ffffff',
                                                fontWeight: 600,
                                              }}>
                                                {incorrectAnswers.length} fout
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Expanded: Show Incorrect Answers or message */}
                                        {isExpanded && (
                                          <div className="mt-2 ml-4">
                                            {incorrectAnswers.length > 0 ? (
                                              <div className="p-2 rounded bg-yellow-50 border-l-4 border-yellow-500">
                                                <div className="text-xs font-bold mb-1" style={{ color: '#000000' }}>
                                                  💡 Leermomenten - Fout beantwoorde vragen:
                                                </div>
                                                <div className="space-y-2">
                                                  {incorrectAnswers.map((item: any, itemIdx: number) => (
                                                    <div key={itemIdx} className="text-xs p-2 bg-white rounded border border-yellow-300">
                                                      <div className="font-semibold text-gray-800 mb-1">{item.question}</div>
                                                      <div className="text-red-600 mb-0.5">Kind antwoordde: "{item.childAnswer}"</div>
                                                      <div className="text-green-600">Juiste antwoord: "{item.correctAnswer}"</div>
                                                      {item.date && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                          {new Date(item.date).toLocaleDateString('nl-NL')}
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="p-2 rounded bg-gray-50 border-l-4 border-gray-300">
                                                <div className="text-xs text-gray-600">
                                                  Geen fout beantwoorde vragen voor dit segment. Goed gedaan! 🎉
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>
              )}


              {(!reportData.stories || reportData.stories.length === 0) && 
               (!reportData.comprehensionResults || reportData.comprehensionResults.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>Geen activiteit in de afgelopen 7 dagen.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

