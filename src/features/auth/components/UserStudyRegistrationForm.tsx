
import React, { useState } from 'react';
import { User, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Language } from '@/types/common';

interface UserStudyRegistrationFormProps {
  language: Language;
  onComplete: (userData: {
    name: string;
    age: number;
    gender: string;
    nationality: string;
    dataUsageApproved: boolean;
  }) => void;
  onBack?: () => void;
}

const texts = {
  EN: {
    title: 'Research Study Registration',
    subtitle: 'Help us improve waste sorting education',
    name: 'Full Name',
    namePlaceholder: 'Enter your full name',
    age: 'Age',
    agePlaceholder: 'Enter your age',
    gender: 'Gender',
    genderPlaceholder: 'Select your gender',
    nationality: 'Nationality',
    nationalityPlaceholder: 'Enter your nationality',
    dataConsentTitle: 'Data Usage Consent',
    dataConsentText: 'I understand and agree that my data will be used for research purposes to study user behavior and improve waste sorting education. This includes my gameplay data, responses, and demographic information.',
    dataConsentAgree: 'I agree to participate in this research study',
    completeRegistration: 'Complete Registration',
    requiredField: 'This field is required',
    ageInvalid: 'Please enter a valid age (13-100)',
    mustConsent: 'You must agree to participate in the research study to continue',
    genderOptions: {
      male: 'Male',
      female: 'Female',
      nonBinary: 'Non-binary',
      preferNotToSay: 'Prefer not to say',
      other: 'Other'
    }
  },
  DE: {
    title: 'Forschungsstudie Registrierung',
    subtitle: 'Helfen Sie uns, die Mülltrennung zu verbessern',
    name: 'Vollständiger Name',
    namePlaceholder: 'Geben Sie Ihren vollständigen Namen ein',
    age: 'Alter',
    agePlaceholder: 'Geben Sie Ihr Alter ein',
    gender: 'Geschlecht',
    genderPlaceholder: 'Wählen Sie Ihr Geschlecht',
    nationality: 'Staatsangehörigkeit',
    nationalityPlaceholder: 'Geben Sie Ihre Staatsangehörigkeit ein',
    dataConsentTitle: 'Datennutzung Einverständnis',
    dataConsentText: 'Ich verstehe und stimme zu, dass meine Daten für Forschungszwecke verwendet werden, um das Nutzerverhalten zu studieren und die Bildung zur Mülltrennung zu verbessern. Dies umfasst meine Spieldaten, Antworten und demografischen Informationen.',
    dataConsentAgree: 'Ich stimme der Teilnahme an dieser Forschungsstudie zu',
    completeRegistration: 'Registrierung abschließen',
    requiredField: 'Dieses Feld ist erforderlich',
    ageInvalid: 'Bitte geben Sie ein gültiges Alter ein (13-100)',
    mustConsent: 'Sie müssen der Teilnahme an der Forschungsstudie zustimmen, um fortzufahren',
    genderOptions: {
      male: 'Männlich',
      female: 'Weiblich',
      nonBinary: 'Nicht-binär',
      preferNotToSay: 'Möchte nicht sagen',
      other: 'Andere'
    }
  }
};

const UserStudyRegistrationForm: React.FC<UserStudyRegistrationFormProps> = ({ 
  language, 
  onComplete,
  onBack 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    nationality: '',
    dataUsageApproved: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const t = texts[language];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.requiredField;
    }

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 13 || age > 100) {
      newErrors.age = t.ageInvalid;
    }

    if (!formData.gender) {
      newErrors.gender = t.requiredField;
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = t.requiredField;
    }

    if (!formData.dataUsageApproved) {
      newErrors.dataUsageApproved = t.mustConsent;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      onComplete({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        nationality: formData.nationality.trim(),
        dataUsageApproved: formData.dataUsageApproved
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-white dark:text-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <User className="w-16 h-16 mx-auto mb-4 text-blue-300 dark:text-purple-300" />
          <h1 className="text-3xl font-bold mb-2 dark:text-white">{t.title}</h1>
          <p className="text-blue-100 dark:text-purple-200">{t.subtitle}</p>
        </div>

        <div className="bg-white/10 dark:bg-gray-800/50 dark:border dark:border-purple-500/30 rounded-3xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-100 dark:text-purple-200">
                {t.name} *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.namePlaceholder}
                className="w-full bg-white/20 dark:bg-gray-700/50 border-white/30 dark:border-purple-400/30 text-white dark:text-gray-100 placeholder-gray-300 dark:placeholder-purple-300"
              />
              {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Age Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-100 dark:text-purple-200">
                {t.age} *
              </label>
              <Input
                type="number"
                min="13"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder={t.agePlaceholder}
                className="w-full bg-white/20 dark:bg-gray-700/50 border-white/30 dark:border-purple-400/30 text-white dark:text-gray-100 placeholder-gray-300 dark:placeholder-purple-300"
              />
              {errors.age && <p className="text-red-300 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Gender Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-100 dark:text-purple-200">
                {t.gender} *
              </label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="w-full bg-white/20 dark:bg-gray-700/50 border-white/30 dark:border-purple-400/30 text-white dark:text-gray-100">
                  <SelectValue placeholder={t.genderPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t.genderOptions.male}</SelectItem>
                  <SelectItem value="female">{t.genderOptions.female}</SelectItem>
                  <SelectItem value="non-binary">{t.genderOptions.nonBinary}</SelectItem>
                  <SelectItem value="prefer-not-to-say">{t.genderOptions.preferNotToSay}</SelectItem>
                  <SelectItem value="other">{t.genderOptions.other}</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-300 text-sm mt-1">{errors.gender}</p>}
            </div>

            {/* Nationality Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-100 dark:text-purple-200">
                {t.nationality} *
              </label>
              <Input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder={t.nationalityPlaceholder}
                className="w-full bg-white/20 dark:bg-gray-700/50 border-white/30 dark:border-purple-400/30 text-white dark:text-gray-100 placeholder-gray-300 dark:placeholder-purple-300"
              />
              {errors.nationality && <p className="text-red-300 text-sm mt-1">{errors.nationality}</p>}
            </div>

            {/* Data Consent Section */}
            <div className="bg-blue-900/30 dark:bg-purple-900/30 rounded-xl p-4 border border-blue-400/30 dark:border-purple-400/30">
              <div className="flex items-start space-x-3 mb-3">
                <Shield className="w-5 h-5 text-blue-300 dark:text-purple-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-100 dark:text-purple-200 mb-2">
                    {t.dataConsentTitle}
                  </h3>
                  <p className="text-sm text-blue-200 dark:text-purple-300 leading-relaxed">
                    {t.dataConsentText}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataConsent"
                  checked={formData.dataUsageApproved}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, dataUsageApproved: !!checked })
                  }
                  className="border-blue-300 dark:border-purple-300 data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-purple-500"
                />
                <label 
                  htmlFor="dataConsent" 
                  className="text-sm text-blue-100 dark:text-purple-200 cursor-pointer"
                >
                  {t.dataConsentAgree} *
                </label>
              </div>
              {errors.dataUsageApproved && (
                <div className="flex items-center space-x-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red-300" />
                  <p className="text-red-300 text-sm">{errors.dataUsageApproved}</p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Loading...' : t.completeRegistration}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserStudyRegistrationForm;
