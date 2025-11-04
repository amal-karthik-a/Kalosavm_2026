import React, { useState, useEffect } from "react";
import { db } from "./FirebaseConfig/firebase";
import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  Upload,
  Plus,
  Trash2,
  Award,
  Users,
  Save,
  CheckCircle,
  Link,
  ExternalLink,
} from "lucide-react";

const AdminApp = () => {
  const [categories] = useState(["LP", "UP", "ഹൈസ്കൂൾ", "ഹയർ സെക്കൻഡറി"]);
  const [competitions, setCompetitions] = useState({});
  const [results, setResults] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("LP");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [newCompetition, setNewCompetition] = useState("");
  const [pdfLink, setPdfLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const compRef = doc(db, "kalolsavam", "competitions");
        const resultRef = doc(db, "kalolsavam", "results");

        const compSnap = await getDoc(compRef);
        const resultSnap = await getDoc(resultRef);

        if (compSnap.exists()) setCompetitions(compSnap.data());
        if (resultSnap.exists()) setResults(resultSnap.data());
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // -----------------------------------------------------

  // ------------------ SAVE DATA ------------------
  const saveCompetitions = async (newCompetitions) => {
    try {
      setSaveStatus("saving");
      await setDoc(doc(db, "kalolsavam", "competitions"), newCompetitions);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      console.error(err);
      alert("സേവ് ചെയ്യുന്നതിൽ പിശക്! വീണ്ടും ശ്രമിക്കുക.");
      setSaveStatus("error");
    }
  };

  const saveResults = async (newResults) => {
    try {
      setSaveStatus("saving");
      await setDoc(doc(db, "kalolsavam", "results"), newResults);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      console.error(err);
      alert("ഫലം സേവ് ചെയ്യുന്നതിൽ പിശക്!");
      setSaveStatus("error");
    }
  };
  // -----------------------------------------------------

  const addCompetition = () => {
    if (newCompetition.trim() && selectedCategory) {
      const updated = {
        ...competitions,
        [selectedCategory]: [
          ...(competitions[selectedCategory] || []),
          newCompetition.trim(),
        ],
      };
      setCompetitions(updated);
      saveCompetitions(updated);
      setNewCompetition("");
      alert("മത്സരം വിജയകരമായി ചേർത്തു!");
    } else {
      alert("മത്സരത്തിന്റെ പേര് നൽകുക!");
    }
  };

  const deleteCompetition = (category, index) => {
    if (confirm("ഈ മത്സരം ഡിലീറ്റ് ചെയ്യണമെന്ന് ഉറപ്പാണോ?")) {
      const updated = {
        ...competitions,
        [category]: competitions[category].filter((_, i) => i !== index),
      };
      setCompetitions(updated);
      saveCompetitions(updated);
    }
  };

  const uploadResult = () => {
    if (pdfLink.trim() && selectedCategory && selectedCompetition) {
      try {
        new URL(pdfLink);
      } catch {
        alert("ശരിയായ PDF link നൽകുക! (https:// ൽ തുടങ്ങണം)");
        return;
      }

      const key = `${selectedCategory}-${selectedCompetition}`;
      const updated = {
        ...results,
        [key]: {
          pdfLink: pdfLink.trim(),
          uploadedAt: new Date().toISOString(),
          uploadedDate: new Date().toLocaleString("ml-IN"),
        },
      };
      setResults(updated);
      saveResults(updated);
      setPdfLink("");
      setSelectedCompetition("");
      alert("ഫലം വിജയകരമായി ചേർത്തു!");
    } else {
      alert("വിഭാഗം, മത്സരം, PDF ലിങ്ക് എന്നിവ നൽകുക!");
    }
  };

  const deleteResult = (key) => {
    if (confirm("ഈ ഫലം ഡിലീറ്റ് ചെയ്യണമെന്ന് ഉറപ്പാണോ?")) {
      const updated = { ...results };
      delete updated[key];
      setResults(updated);
      saveResults(updated);
      alert("ഫലം ഡിലീറ്റ് ചെയ്തു!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl text-purple-600 font-bold">ലോഡ് ചെയ്യുന്നു...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-3">
                <Award className="w-8 h-8" />
                അഡ്മിൻ പാനൽ
              </h1>
              <p className="text-gray-600 mt-1">മേലടി ഉപജില്ല സ്കൂൾ കലോത്സവം 2025</p>
            </div>
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle className="w-5 h-5" />
                സേവ് ചെയ്തു
              </div>
            )}
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Save className="w-5 h-5 animate-pulse" />
                സേവ് ചെയ്യുന്നു...
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column - Add competitions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                പുതിയ മത്സരം ചേർക്കുക
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">വിഭാഗം</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">മത്സരത്തിന്റെ പേര്</label>
                  <input
                    type="text"
                    value={newCompetition}
                    onChange={(e) => setNewCompetition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCompetition()}
                    placeholder="ഉദാ: മാപ്പിളപ്പാട്ട്, കഥാപ്രസംഗം"
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  />
                </div>
                <button
                  onClick={addCompetition}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-lg shadow-lg"
                >
                  മത്സരം ചേർക്കുക
                </button>
              </div>
            </div>

            {/* Competition list */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                മത്സരങ്ങളുടെ പട്ടിക
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {categories.map(cat => (
                  competitions[cat] && competitions[cat].length > 0 && (
                    <div key={cat} className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-bold text-lg text-blue-800 mb-3">{cat}</h3>
                      <div className="space-y-2">
                        {competitions[cat].map((comp, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <span className="text-gray-800 font-medium">{comp}</span>
                            <button
                              onClick={() => deleteCompetition(cat, idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                {Object.keys(competitions).length === 0 && (
                  <p className="text-gray-500 text-center py-8">ഇതുവരെ മത്സരങ്ങൾ ചേർത്തിട്ടില്ല</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Upload Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <Link className="w-6 h-6" />
                ഫലം അപ്‌ലോഡ് ചെയ്യുക
              </h2>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  എങ്ങനെ PDF link ലഭിക്കും?
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>1. PDF Google Drive ൽ അപ്‌ലോഡ് ചെയ്യുക</li>
                  <li>2. Share → Anyone with the link → Copy link</li>
                  <li>3. ആ link ഇവിടെ paste ചെയ്യുക</li>
                </ol>
                <p className="text-xs text-blue-600 mt-2">💡 Tip: Dropbox, OneDrive links ഉം പ്രവർത്തിക്കും!</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">വിഭാഗം</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedCompetition('');
                    }}
                    className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">മത്സരം</label>
                  <select
                    value={selectedCompetition}
                    onChange={(e) => setSelectedCompetition(e.target.value)}
                    className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                  >
                    <option value="">മത്സരം തിരഞ്ഞെടുക്കുക</option>
                    {(competitions[selectedCategory] || []).map((comp, idx) => (
                      <option key={idx} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    PDF Link
                  </label>
                  <input
                    type="url"
                    value={pdfLink}
                    onChange={(e) => setPdfLink(e.target.value)}
                    placeholder="https://drive.google.com/file/..."
                    className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none bg-white"
                  />
                  {pdfLink && (
                    <div className="mt-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      ✓ Link നൽകി
                    </div>
                  )}
                </div>
                <button
                  onClick={uploadResult}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  ഫലം ചേർക്കുക
                </button>
              </div>
            </div>

            {/* Uploaded Results */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-orange-900 mb-6">ചേർത്ത ഫലങ്ങൾ</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.keys(results).length > 0 ? (
                  Object.entries(results).map(([key, data]) => {
                    const [cat, comp] = key.split('-');
                    return (
                      <div key={key} className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{cat}</p>
                            <p className="text-gray-700">{comp}</p>
                            <a 
                              href={data.pdfLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link കാണുക
                            </a>
                            <p className="text-xs text-gray-500 mt-1">{data.uploadedDate}</p>
                          </div>
                          <button
                            onClick={() => deleteResult(key)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">ഇതുവരെ ഫലങ്ങൾ ചേർത്തിട്ടില്ല</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApp;
