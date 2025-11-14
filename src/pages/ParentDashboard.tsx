import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      setError(err.response?.data?.message || 'Login mislukt');
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
      console.error('Registration error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Request URL:', err.config?.url);
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response) {
        setError(`Kan niet verbinden met de backend. Controleer of de backend online is: ${API_BASE_URL.replace('/api', '')}/health`);
      } else if (err.response?.status === 0) {
        setError('CORS error: Backend staat geen requests toe van deze frontend. Check CORS_ORIGIN in backend.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status) {
        setError(`Server error (${err.response.status}): ${err.response.statusText || 'Onbekende fout'}`);
      } else {
        setError(err.message || 'Registratie mislukt');
      }
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
      setError(err.response?.data?.message || 'Fout bij ophalen kinderen');
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
      setError(err.response?.data?.message || 'Fout bij toevoegen kind');
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
      setError(err.response?.data?.message || 'Fout bij verwijderen kind');
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
      console.error('❌ Error requesting report:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
      });
      
      let errorMessage = 'Fout bij ophalen rapport';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.response?.status === 404) {
        errorMessage = 'Kind niet gevonden of geen toegang';
      } else if (err.response?.status === 403) {
        errorMessage = 'Geen toegang tot dit rapport';
      } else if (err.response?.status === 401) {
        errorMessage = 'Niet ingelogd. Log opnieuw in.';
      } else if (!err.response) {
        errorMessage = 'Kan geen verbinding maken met de server. Controleer of de backend draait.';
      }
      
      setError(errorMessage);
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
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#667eea' }}>📖 Verhalen van deze week</h3>
                  <div className="flex flex-col gap-4">
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
                      
                      return (
                        <div
                          key={story.session_id || story.sessionId || idx}
                          className="p-4 rounded-xl transition-all"
                          style={{
                            background: story.isCompleted
                              ? 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)'
                              : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                            border: `2px solid ${story.isCompleted ? '#00bcd4' : '#9c27b0'}`,
                            boxShadow: story.isCompleted
                              ? '0 0 20px rgba(0, 188, 212, 0.3)'
                              : '0 0 20px rgba(156, 39, 176, 0.3)',
                          }}
                        >
                          {/* Horizontal Row Layout */}
                          <div className="flex items-center justify-between gap-4">
                            {/* Left: Story Info */}
                            <div className="flex-1 flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3
                                    className="text-lg font-bold"
                                    style={{
                                      color: story.isCompleted ? '#006064' : '#4a148c',
                                      fontFamily: "'Poppins', sans-serif",
                                    }}
                                  >
                                    {story.character} verhaal
                                  </h3>
                                  {story.isCompleted && (
                                    <span
                                      className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                                      style={{
                                        background: '#00bcd4',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                      }}
                                    >
                                      ✓ Voltooid
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span style={{ 
                                    color: '#000000',
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: 600,
                                  }}>
                                    📅 {new Date(story.date || story.created_at).toLocaleDateString('nl-NL')}
                                  </span>
                                  <span style={{ 
                                    color: '#000000',
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: 600,
                                  }}>
                                    📖 {story.segmentCount} {story.segmentCount === 1 ? 'segment' : 'segmenten'}
                                  </span>
                                  {avgScore !== null && (
                                    <span 
                                      style={{ 
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        background: story.isCompleted ? '#00bcd4' : '#9c27b0',
                                        color: '#ffffff',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                      }}
                                    >
                                      ⭐ {avgScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: Delete Button */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  if (!window.confirm('Weet je zeker dat je dit verhaal wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
                                    return;
                                  }
                                  try {
                                    await axios.delete(
                                      `${API_BASE_URL}/auth/parent/story/${story.session_id}`,
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
                                    console.error('Error deleting story:', err);
                                    alert('Fout bij verwijderen verhaal: ' + (err.response?.data?.message || err.message));
                                  }
                                }}
                                className="flex-shrink-0 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
                                style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                  color: '#333333',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '3px solid #ffffff',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1)',
                                  fontSize: '24px',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title="Verhaal verwijderen"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25), 0 0 30px rgba(0, 0, 0, 0.15)';
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                  e.currentTarget.style.background = 'linear-gradient(135deg, #d0d0d0 0%, #a0a0a0 100%)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1)';
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.background = 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)';
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Test Results - Below the row, collapsible or always visible */}
                          {story.testResults && story.testResults.length > 0 && (
                            <div className="mt-3 pt-3 border-t-2" style={{ borderColor: story.isCompleted ? '#00bcd4' : '#9c27b0' }}>
                              <div className="text-sm font-bold mb-2" style={{ 
                                color: '#000000',
                                fontFamily: "'Poppins', sans-serif",
                              }}>
                                Test Scores (Beste score per segment):
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
                                    return (
                                      <div
                                        key={test.id || `segment-${segmentSeq}-${testIdx}`}
                                        className="px-3 py-2 rounded-lg"
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
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-bold" style={{ color: '#000000' }}>
                                            Segment {segmentSeq}:
                                          </span>
                                          <span className="text-sm font-bold" style={{ 
                                            color: test.percentageScore >= 67 
                                              ? '#4caf50' 
                                              : test.percentageScore >= 33 
                                              ? '#ff9800' 
                                              : '#f44336',
                                          }}>
                                            {test.correctAnswers}/{test.totalQuestions} ({test.percentageScore}%)
                                          </span>
                                        </div>
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
                </div>
              )}

              {/* Incorrect Answers Analysis (from proposal) */}
              {reportData.incorrectAnswers && reportData.incorrectAnswers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#667eea' }}>💡 Leermomenten</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Voorbeelden van vragen die fout werden beantwoord - ideaal voor een gesprek met je kind:
                  </p>
                  <div className="space-y-3">
                    {reportData.incorrectAnswers.map((item: any, idx: number) => (
                      <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                        <div className="font-semibold mb-2 text-gray-800">{item.question}</div>
                        <div className="text-sm">
                          <span className="text-red-600">Kind antwoordde: "{item.childAnswer}"</span>
                          <br />
                          <span className="text-green-600">Juiste antwoord: "{item.correctAnswer}"</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(item.date).toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                    ))}
                  </div>
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

