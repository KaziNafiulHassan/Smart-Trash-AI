
import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Language } from '@/types/common';
import UserStudyRegistrationForm from './UserStudyRegistrationForm';

interface RegistrationScreenProps {
  language: Language;
  onRegistration: (userData: any) => void;
}

const avatars = [
  { id: 1, emoji: '🌱', name: 'Green Sprout' },
  { id: 2, emoji: '🦋', name: 'Blue Butterfly' },
  { id: 3, emoji: '🌸', name: 'Pink Blossom' },
  { id: 4, emoji: '🌞', name: 'Sunny' },
  { id: 5, emoji: '🐝', name: 'Busy Bee' },
  { id: 6, emoji: '🌈', name: 'Rainbow' },
  { id: 7, emoji: '🍀', name: 'Lucky Clover' },
  { id: 8, emoji: '🌊', name: 'Ocean Wave' }
];

const texts = {
  EN: {
    title: 'Create Your Profile',
    subtitle: 'Choose your eco-warrior avatar and name',
    namePlaceholder: 'Enter your name',
    selectAvatar: 'Select Your Avatar',
    continue: 'Continue to Registration',
    nameRequired: 'Please enter your name',
    back: 'Back'
  },
  DE: {
    title: 'Erstelle Dein Profil',
    subtitle: 'Wähle Deinen Öko-Krieger Avatar und Namen',
    namePlaceholder: 'Gib Deinen Namen ein',
    selectAvatar: 'Wähle Deinen Avatar',
    continue: 'Weiter zur Registrierung',
    nameRequired: 'Bitte gib Deinen Namen ein',
    back: 'Zurück'
  }
};

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ language, onRegistration }) => {
  const [step, setStep] = useState<'avatar' | 'studyForm'>('avatar');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [error, setError] = useState('');

  const t = texts[language];

  const handleAvatarStepComplete = () => {
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    if (!selectedAvatar) {
      return;
    }

    setStep('studyForm');
  };

  const handleStudyFormComplete = (studyData: any) => {
    const avatar = avatars.find(a => a.id === selectedAvatar);
    onRegistration({
      name: studyData.name, // Use the name from study form
      avatar: avatar,
      studyData: studyData
    });
  };

  if (step === 'studyForm') {
    return (
      <UserStudyRegistrationForm
        language={language}
        onComplete={handleStudyFormComplete}
        onBack={() => setStep('avatar')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 text-white">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <User className="w-16 h-16 mx-auto mb-4 text-blue-300" />
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-lg text-blue-100">{t.subtitle}</p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div>
            <Input
              type="text"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full py-3 px-4 text-lg bg-white/20 border-white/30 text-white placeholder-white/70 rounded-xl"
            />
            {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">{t.selectAvatar}</h3>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`p-3 rounded-xl text-3xl transition-all duration-200 ${
                    selectedAvatar === avatar.id
                      ? 'bg-white/30 scale-110 ring-2 ring-yellow-300'
                      : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
            {selectedAvatar && (
              <p className="text-center mt-2 text-blue-200">
                {avatars.find(a => a.id === selectedAvatar)?.name}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleAvatarStepComplete}
          disabled={!name.trim() || !selectedAvatar}
          className="w-full max-w-sm mt-8 py-4 text-lg font-semibold bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          {t.continue}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationScreen;
