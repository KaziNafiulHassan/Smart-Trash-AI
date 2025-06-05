
import React from 'react';
import { Database, Server, Image, Users, Brain, FileText, Trophy, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BackendChart: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">EcoSort Backend Architecture</h1>
        <p className="text-gray-600">Complete overview of your Supabase-powered backend</p>
      </div>

      {/* Supabase Services */}
      <Card className="bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-6 h-6 text-green-600" />
            Supabase Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <Database className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">PostgreSQL Database</h3>
              <p className="text-sm text-gray-600">7 tables with RLS policies</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <Brain className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold">Edge Functions</h3>
              <p className="text-sm text-gray-600">AI classification & feedback</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <Users className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-semibold">Authentication</h3>
              <p className="text-sm text-gray-600">Email/password auth</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Database Tables & Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User-Related Tables */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">User Management</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">profiles</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• id (UUID, references auth.users)</p>
                  <p>• name, language, avatar_emoji</p>
                  <p>• Auto-created on user signup</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">user_progress</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• level, total_correct, total_attempts</p>
                  <p>• best_score, current_streak</p>
                  <p>• Tracks game progression</p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">user_achievements</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• Links users to achievements</p>
                  <p>• unlocked_at timestamp</p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold">game_sessions</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• Individual game results</p>
                  <p>• score, accuracy, time_spent</p>
                </div>
              </div>
            </div>

            {/* Content & AI Tables */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Content & AI</h3>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">waste_items</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• Game content (items to sort)</p>
                  <p>• Multi-language names & descriptions</p>
                  <p>• Links to categories</p>
                </div>
              </div>

              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-cyan-600" />
                  <span className="font-semibold">categories</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• Waste categories & bin types</p>
                  <p>• paper, plastic, glass, bio, etc.</p>
                  <p>• Sorting rules in EN/DE</p>
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-5 h-5 text-rose-600" />
                  <span className="font-semibold">image_classifications</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• AI classification results</p>
                  <p>• User feedback & corrections</p>
                  <p>• Confidence scores</p>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold">achievements</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>• Available achievements</p>
                  <p>• Multi-language descriptions</p>
                  <p>• Unlock conditions</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edge Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Edge Functions (AI Services)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">classify-waste-image</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Purpose:</strong> Real-time image classification</p>
                <p><strong>AI Model:</strong> Hugging Face EfficientNetB0</p>
                <p><strong>Input:</strong> Base64 image + user ID</p>
                <p><strong>Output:</strong> Category, bin type, confidence</p>
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Image upload to Supabase Storage</li>
                  <li>Category matching from database</li>
                  <li>Multi-language feedback</li>
                  <li>Result storage for feedback</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">generate-feedback</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Purpose:</strong> Game feedback generation</p>
                <p><strong>AI Service:</strong> External LLM API</p>
                <p><strong>Input:</strong> Item details + user choice</p>
                <p><strong>Output:</strong> Educational feedback</p>
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Context-aware responses</li>
                  <li>Encouragement & tips</li>
                  <li>Multi-language support</li>
                  <li>Fallback messages</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Data Flow Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">🏠 Game Mode Flow</h3>
              <div className="text-sm space-y-2">
                <p>1. <strong>dataService.getGameData()</strong> → Fetches waste_items + categories</p>
                <p>2. User sorts item → <strong>feedbackService.generateFeedback()</strong></p>
                <p>3. Result saved → <strong>gameService.updateUserProgress()</strong></p>
                <p>4. Session logged → <strong>game_sessions</strong> table</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">📸 Real-time Sorting Flow</h3>
              <div className="text-sm space-y-2">
                <p>1. User takes photo → Camera component captures base64</p>
                <p>2. <strong>classify-waste-image</strong> edge function processes image</p>
                <p>3. Hugging Face API classifies → Categories database lookup</p>
                <p>4. Result stored → <strong>image_classifications</strong> table</p>
                <p>5. User feedback → Updates classification record</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">👤 User Journey</h3>
              <div className="text-sm space-y-2">
                <p>1. Sign up → <strong>handle_new_user()</strong> trigger creates profile + progress</p>
                <p>2. Play games → Progress tracked in <strong>user_progress</strong></p>
                <p>3. Unlock achievements → <strong>user_achievements</strong> table</p>
                <p>4. View profile → Aggregated data from multiple tables</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secrets & Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>External Integrations & Secrets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🤗 Hugging Face</h3>
              <p className="text-sm">HUGGING_FACE_TOKEN for image classification</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🧠 OpenAI</h3>
              <p className="text-sm">OPENAI_API_KEY for potential future features</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🗄️ Supabase</h3>
              <p className="text-sm">Auto-configured URL, keys & service tokens</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🔒 Security</h3>
              <p className="text-sm">Row Level Security (RLS) on all user tables</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendChart;
