import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { createShareUrl } from '../utils/shareUtils';
import TextBalloon from '../components/common/TextBalloon';
import StarryBackground from '../components/common/StarryBackground';
import ZodiacIcon from '../components/ZodiacIcon';
import type { ZodiacSign } from '../components/ZodiacIcon';
import InterpretationCard from '../components/InterpretationCard';
import ShareModal from '../components/ShareModal';

// Import interpretation data
import interpretationsEn from '../data/interpretations_en.json';
import interpretationsKo from '../data/interpretations_ko.json';

interface FormData {
  name: string;
  gender: string;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign;
}

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLanguage } = useTranslation();
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Define a proper type for interpretations instead of using 'any'
  interface Interpretations {
    basic_interpretations: {
      sun: Record<string, string>;
      moon: Record<string, string>;
      ascendant: Record<string, string>;
    };
    gender_specific?: {
      [key: string]: {
        sun?: Record<string, string>;
        moon?: Record<string, string>;
      } | Record<string, string>;
    };
  }
  
  const [interpretations, setInterpretations] = useState<Interpretations | null>(null);

  // Get zodiac sign name in current language
  const getZodiacName = (sign: ZodiacSign): string => {
    const zodiacMap: Record<ZodiacSign, { en: string, ko: string }> = {
      aries: { en: 'Aries', ko: '양자리' },
      taurus: { en: 'Taurus', ko: '황소자리' },
      gemini: { en: 'Gemini', ko: '쌍둥이자리' },
      cancer: { en: 'Cancer', ko: '게자리' },
      leo: { en: 'Leo', ko: '사자자리' },
      virgo: { en: 'Virgo', ko: '처녀자리' },
      libra: { en: 'Libra', ko: '천칭자리' },
      scorpio: { en: 'Scorpio', ko: '전갈자리' },
      sagittarius: { en: 'Sagittarius', ko: '궁수자리' },
      capricorn: { en: 'Capricorn', ko: '염소자리' },
      aquarius: { en: 'Aquarius', ko: '물병자리' },
      pisces: { en: 'Pisces', ko: '물고기자리' }
    };
    
    return currentLanguage === 'ko' ? zodiacMap[sign].ko : zodiacMap[sign].en;
  };

  // Load user data from location state
  useEffect(() => {
    if (location.state && location.state.userData) {
      setFormData(location.state.userData);
    } else {
      // Redirect to input page if no data is available
      navigate('/input');
    }
  }, [location, navigate]);

  // Set interpretations based on language
  useEffect(() => {
    setInterpretations(currentLanguage === 'ko' ? interpretationsKo : interpretationsEn);
  }, [currentLanguage]);

  // Handle navigation
  const handleBackToHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/input');
  };
  
  // The link carries only the name and calculated signs; no database is needed.
  const handleShare = () => {
    if (!formData) return;
    setShareUrl(createShareUrl(formData));
    setIsShareModalOpen(true);
  };
  
  // 공유 모달 닫기
  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  // If data or interpretations are not loaded yet, show loading
  if (!formData || !interpretations) {
    return (
      <StarryBackground scrollable={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/80 text-xl">Loading...</div>
        </div>
      </StarryBackground>
    );
  }

  // Get interpretation texts
  const sunInterpretation = interpretations.basic_interpretations.sun[getZodiacName(formData.sunSign)];
  const moonInterpretation = interpretations.basic_interpretations.moon[getZodiacName(formData.moonSign)];
  const risingInterpretation = interpretations.basic_interpretations.ascendant[getZodiacName(formData.risingSign)];
  
  // Get gender-specific interpretations if available
  // Handle different data structures between English and Korean interpretations
  const getSunGenderInterpretation = () => {
    if (!formData || formData.gender === 'other' || !interpretations.gender_specific) return null;
    
    const genderData = interpretations.gender_specific[formData.gender];
    if (!genderData) return null;
    
    // Korean data has sun interpretations under gender_specific.male/female.sun
    if (currentLanguage === 'ko') {
      // Check if genderData has a 'sun' property (it's the object type, not string type)
      if (typeof genderData === 'object' && 'sun' in genderData) {
        const sunData = genderData.sun;
        if (sunData && typeof sunData === 'object') {
          return sunData[getZodiacName(formData.sunSign)];
        }
      }
      return null;
    } 
    // English data has limited gender-specific interpretations
    else {
      // Try to get from English data structure if available
      if (typeof genderData === 'object') {
        const engInterpretation = (genderData as Record<string, string>)[getZodiacName(formData.sunSign)];
        
        // If available, return it
        if (engInterpretation) return engInterpretation;
      }
      
      // If not available, create a custom one
      return `As a ${formData.gender === 'male' ? 'man' : 'woman'} with ${getZodiacName(formData.sunSign)} sun sign, you may experience the typical ${getZodiacName(formData.sunSign)} traits with a ${formData.gender === 'male' ? 'masculine' : 'feminine'} expression.`;
    }
  };
  
  const getMoonGenderInterpretation = () => {
    if (!formData || formData.gender === 'other' || !interpretations.gender_specific) return null;
    
    const genderData = interpretations.gender_specific[formData.gender];
    if (!genderData) return null;
    
    // Korean data has moon interpretations under gender_specific.male/female.moon
    if (currentLanguage === 'ko') {
      if (typeof genderData === 'object' && 'moon' in genderData) {
        const moonData = (genderData as { moon?: Record<string, string> }).moon;
        if (moonData && typeof moonData === 'object') {
          return moonData[getZodiacName(formData.moonSign)];
        }
      }
      return null;
    } 
    // English data has moon interpretations directly under gender_specific.male/female
    else {
      if (typeof genderData === 'object') {
        const engInterpretation = (genderData as Record<string, string>)[getZodiacName(formData.moonSign)];
        if (engInterpretation) return engInterpretation;
      }
      return null;
    }
  };
  
  // Get all gender-specific interpretations
  const sunGenderInterpretation = getSunGenderInterpretation();
  const moonGenderInterpretation = getMoonGenderInterpretation();
  // No gender-specific interpretation for Ascendant as per requirement

  return (
    <StarryBackground scrollable={true}>
      <div className="min-h-screen flex flex-col w-full overflow-auto">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-8 py-4 bg-space-blue/50 backdrop-blur-sm">
          <div className="w-32">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-extralight text-white/90 typing-animation logo-text"
            >
              Askstar
            </motion.div>
          </div>
          <div className="flex gap-2">
            {/* Progress dots */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-4 py-8 overflow-y-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-light text-white/90 mb-2">
                {t('result.title')}
              </h1>
              <p className="text-white/70 text-lg">
                {t('result.subtitle').replace('{name}', formData.name)}
              </p>
            </div>

            {/* Zodiac Icons Section */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex flex-col items-center">
                <ZodiacIcon 
                  sign={formData.sunSign} 
                  type="sun" 
                  size={80} 
                  className="mb-3"
                />
                <p className="text-white/90 font-light">{t('result.sunSign')}</p>
                <p className="text-white font-medium">{getZodiacName(formData.sunSign)}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <ZodiacIcon 
                  sign={formData.moonSign} 
                  type="moon" 
                  size={80} 
                  className="mb-3"
                />
                <p className="text-white/90 font-light">{t('result.moonSign')}</p>
                <p className="text-white font-medium">{getZodiacName(formData.moonSign)}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <ZodiacIcon 
                  sign={formData.risingSign} 
                  type="rising" 
                  size={80} 
                  className="mb-3"
                />
                <p className="text-white/90 font-light">{t('result.risingSign')}</p>
                <p className="text-white font-medium">{getZodiacName(formData.risingSign)}</p>
              </div>
            </div>

            {/* Interpretation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 auto-rows-auto">
              {/* Basic Interpretations */}
              <InterpretationCard
                type="sun"
                sign={formData.sunSign}
                title={t('result.sunTitle')}
                content={sunInterpretation}
                delay={0.2}
              />
              
              <InterpretationCard
                type="moon"
                sign={formData.moonSign}
                title={t('result.moonTitle')}
                content={moonInterpretation}
                delay={0.4}
              />
              
              <InterpretationCard
                type="rising"
                sign={formData.risingSign}
                title={t('result.risingTitle')}
                content={risingInterpretation}
                delay={0.6}
              />

              {/* Gender-specific Interpretations */}
              {sunGenderInterpretation && (
                <InterpretationCard
                  type="sun"
                  sign={formData.sunSign}
                  title={`${t('result.sunSign')} - ${t('result.genderSpecific')}`}
                  content={sunGenderInterpretation}
                  isGenderSpecific={true}
                  delay={0.8}
                />
              )}
              
              {moonGenderInterpretation && (
                <InterpretationCard
                  type="moon"
                  sign={formData.moonSign}
                  title={`${t('result.moonSign')} - ${t('result.genderSpecific')}`}
                  content={moonGenderInterpretation}
                  isGenderSpecific={true}
                  delay={1.0}
                />
              )}
              
              {/* No gender-specific interpretation for Ascendant as per requirement */}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-300 text-white/90 border border-white/20"
                onClick={handleBackToHome}
              >
                {t('result.backToHome')}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2 bg-star-gold/20 hover:bg-star-gold/30 rounded-full transition-colors duration-300 text-white/90 border border-star-gold/30"
                onClick={handleTryAgain}
              >
                {t('result.tryAgain')}
              </motion.button>
              
              <TextBalloon text={t('tooltip.preparing')} position="top">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-full transition-colors duration-300 text-white/90 border border-purple-500/30"
                >
                  {t('result.compatibility')}
                </motion.button>
              </TextBalloon>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full transition-colors duration-300 text-white/90 border border-blue-400/30"
                onClick={handleShare}
              >
                {t('result.share')}
              </motion.button>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-white/25 font-extralight text-xs tracking-widest w-full">
          <p>© 2025 askstar. All rights reserved.</p>
        </footer>
        {/* ShareModal */}
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={handleCloseShareModal} 
          shareUrl={shareUrl} 
        />
      </div>
    </StarryBackground>
  );
};



export default ResultPage;
