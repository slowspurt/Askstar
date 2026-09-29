import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import StarryBackground from '../components/common/StarryBackground';
import CitySearch from '../components/CitySearch';
import { calculateBig3, type BirthData } from '../utils/astrology';
import { calculateSunSign } from '../utils/sunSignCalculator';

// No longer need to define zodiac signs as we're calculating them

const InputPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Ref to store selected city coordinates
  const selectedCityCoords = React.useRef<{latitude: number, longitude: number}>({ latitude: 37.5665, longitude: 126.9780 });
  
  const handleBackClick = () => {
    navigate('/');
  };
  
  // Form state and validation
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    sunSign: '',
    moonSign: '',
    risingSign: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '',
    birthMinute: '',
    city: ''
  });
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [cityAttempted, setCityAttempted] = useState<boolean>(false);
  
  // Check form validity whenever form data changes
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const invalidFields: Record<string, boolean> = {};
    
    // Validate name
    if (formData.name === '') {
      newErrors.name = t('input.error.required');
    }
    
    // Validate gender
    if (formData.gender === '') {
      newErrors.gender = t('input.error.required');
    }
    
    // Validate birth date
    if (formData.birthYear === '' || formData.birthMonth === '' || formData.birthDay === '') {
      newErrors.birthDate = t('input.error.required');
    } else {
      const year = parseInt(formData.birthYear);
      const month = parseInt(formData.birthMonth);
      const day = parseInt(formData.birthDay);
      
      // Simple date validation
      if (year < 1900 || year > new Date().getFullYear() || month < 1 || month > 12 || day < 1 || day > 31) {
        newErrors.birthDate = t('input.error.invalidDate');
        invalidFields.birthDate = true;
      }
    }
    
    // Validate birth time
    if (formData.birthHour === '' || formData.birthMinute === '') {
      newErrors.birthTime = t('input.error.required');
    } else {
      const hour = parseInt(formData.birthHour);
      const minute = parseInt(formData.birthMinute);
      
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        newErrors.birthTime = t('input.error.invalidTime');
        invalidFields.birthTime = true;
      }
    }
    
    // City is always required for form submission
    if (formData.city === '') {
      newErrors.city = t('input.error.required');
    }
    
    // Update errors state
    setErrors(newErrors);
    
    // Form is valid if there are no errors
    setIsFormValid(Object.keys(newErrors).length === 0);
    
    // No need to set show errors state anymore, errors are shown based on cityAttempted
  }, [formData, t, touchedFields]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };
  
  // Handle city selection
  const handleCitySelect = (city: string, latitude: number, longitude: number) => {
    // Store city and coordinates in form data
    setFormData(prev => ({
      ...prev,
      city,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }));
    // Mark city field as touched
    setTouchedFields(prev => ({ ...prev, city: true }));
    // Mark that user has attempted to enter city data
    setCityAttempted(true);
    // Store coordinates in a ref for use in calculation
    if (city && latitude && longitude) {
      // Use these values in calculateBig3Signs
      selectedCityCoords.current = { latitude, longitude };
    }
    
    // Update errors for city field
    setErrors(prev => ({
      ...prev,
      city: city ? '' : t('input.error.required')
    }));
  };

  // Calculate Big 3 based on birth data
  const calculateBig3Signs = () => {
    try {
      // Parse birth date from form data
      const birthYear = parseInt(formData.birthYear);
      const birthMonth = parseInt(formData.birthMonth);
      const birthDay = parseInt(formData.birthDay);
      
      console.log(`Birth date: ${birthYear}-${birthMonth}-${birthDay}`);
      
      // Create birth data with original date
      const birthData: BirthData = {
        year: birthYear,
        month: birthMonth,
        day: birthDay,
        hour: parseInt(formData.birthHour),
        minute: parseInt(formData.birthMinute),
        latitude: selectedCityCoords.current.latitude,
        longitude: selectedCityCoords.current.longitude
      };

      // Calculate Moon and Rising using the astrology library
      const big3Result = calculateBig3(birthData);
      
      // Calculate Sun sign manually using our custom function
      const manualSunSign = calculateSunSign(birthMonth, birthDay);
      console.log(`Manual Sun sign calculation: ${manualSunSign}`);
      
      // Create final result with manual Sun sign and library-calculated Moon and Rising
      const big3 = {
        sunSign: manualSunSign,
        moonSign: big3Result.moonSign,
        risingSign: big3Result.risingSign
      };
      
      // Update form data with calculated signs
      setFormData(prev => ({
        ...prev,
        sunSign: big3.sunSign,
        moonSign: big3.moonSign,
        risingSign: big3.risingSign
      }));
      
      return big3;
    } catch (error) {
      console.error('Error calculating Big 3:', error);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation is handled by the useEffect
    const allFields = {
      name: true,
      gender: true,
      birthYear: true,
      birthMonth: true,
      birthDay: true,
      birthHour: true,
      birthMinute: true,
      city: true
    };
    setTouchedFields(allFields);
    // City is attempted when form is submitted
    setCityAttempted(true);
    
    if (isFormValid) {
      try {
        // Calculate Big 3 signs
        const big3 = calculateBig3Signs();
        
        if (big3) {
          // Navigate to loading page with form data
          navigate('/loading', {
            state: {
              userData: {
                name: formData.name,
                gender: formData.gender,
                sunSign: big3.sunSign,
                moonSign: big3.moonSign,
                risingSign: big3.risingSign
              }
            }
          });
        } else {
          // Handle calculation error
          setErrors(prev => ({
            ...prev,
            calculation: t('input.error.calculation')
          }));
        }
      } catch (error) {
        console.error('Error calculating Big 3 signs:', error);
        setErrors(prev => ({
          ...prev,
          calculation: t('input.error.calculation')
        }));
      }
    }
  };
  
  // Gender options
  const genderOptions = [
    { value: 'male', label: t('input.gender.male') },
    { value: 'female', label: t('input.gender.female') },
    { value: 'other', label: t('input.gender.other') }
  ];

  return (
    <StarryBackground scrollable={true}>
      <div className="flex flex-col min-h-screen w-full overflow-auto">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-8 py-4 bg-black/20 backdrop-blur-sm">
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
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-10 overflow-y-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl relative z-30"
          >
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-visible max-w-2xl mx-auto">
              <div className="p-6 md:p-8 flex flex-col items-center">
                <div className="max-w-xl w-full mb-6">
                  <h1 className="text-2xl md:text-3xl font-light text-white/90 mb-2 text-center">
                    {t('input.title')}
                  </h1>
                  <p className="text-white/70 text-center">
                    {t('input.subtitle')}
                  </p>
                  <p className="text-white/50 text-center text-xs mt-1">
                    {t('input.privacyNotice')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col max-w-xl mx-auto space-y-4 w-full">
                  {/* Single column layout */}
                  <div className="space-y-4 w-full">
                    {/* Name and Gender in one row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {/* Name input - 2 columns */}
                      <div className="col-span-2">
                        <label className="block text-white/90 text-sm mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          {t('input.name.label')}
                        </label>
                        <input
                          type="text"
                          name="name"
                          maxLength={100}
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t('input.name.placeholder')}
                          className={`w-full bg-white backdrop-blur-md border rounded-lg px-3 py-2 text-black focus:outline-none focus:border-white/30 transition-colors`}
                          style={{ boxSizing: 'border-box', height: '40px' }}
                        />
                      </div>

                      {/* Gender select - 1 column */}
                      <div>
                        <label className="block text-white/90 text-sm mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                          </svg>
                          {t('input.gender.label')}
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className={`w-full bg-white backdrop-blur-md border rounded-lg px-3 py-2 focus:outline-none focus:border-white/30 transition-colors ${formData.gender === '' ? 'text-gray-400' : 'text-black'}`}
                          style={{ boxSizing: 'border-box', height: '40px' }}
                        >
                          <option value="">{t('input.gender.placeholder')}</option>
                          {genderOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Birth Date */}
                    <div className="mb-4">
                      <label className="block text-white/90 text-sm mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {t('input.birthDate.label')}
                      </label>
                      <div className="flex items-center">
                        {/* Year */}
                        <input
                          type="number"
                          name="birthYear"
                          value={formData.birthYear}
                          onChange={handleInputChange}
                          placeholder={t('input.birthDate.year')}
                          min="1900"
                          max={new Date().getFullYear()}
                          className={`w-full bg-white backdrop-blur-md border rounded-lg px-3 py-2 text-black focus:outline-none focus:border-white/30 transition-colors`}
                        />
                        {/* Separator */}
                        <span className="text-white/50 mx-2 text-lg">/</span>
                        {/* Month */}
                        <input
                          type="number"
                          name="birthMonth"
                          value={formData.birthMonth}
                          onChange={handleInputChange}
                          placeholder={t('input.birthDate.month')}
                          min="1"
                          max="12"
                          className={`w-full bg-white backdrop-blur-md border rounded-lg px-3 py-2 text-black focus:outline-none focus:border-white/30 transition-colors`}
                        />
                        {/* Separator */}
                        <span className="text-white/50 mx-2 text-lg">/</span>
                        {/* Day */}
                        <input
                          type="number"
                          name="birthDay"
                          value={formData.birthDay}
                          onChange={handleInputChange}
                          placeholder={t('input.birthDate.day')}
                          min="1"
                          max="31"
                          className={`w-full bg-white backdrop-blur-md border rounded-lg px-3 py-2 text-black focus:outline-none focus:border-white/30 transition-colors`}
                        />
                      </div>
                    </div>
                    
                    {/* Birth Time */}
                    <div className="mb-4">
                      <label className="block text-white/90 text-sm mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {t('input.birthTime.label')}
                      </label>
                      <div className="flex items-center">
                        {/* Hour */}
                        <input
                          type="number"
                          name="birthHour"
                          value={formData.birthHour}
                          onChange={handleInputChange}
                          placeholder={t('input.birthTime.hour')}
                          min="0"
                          max="23"
                          className={`w-full bg-white backdrop-blur-md border rounded-lg px-3 py-2 text-black focus:outline-none focus:border-white/30 transition-colors`}
                        />
                        {/* Separator */}
                        <span className="text-white/50 mx-2 text-lg">:</span>
                        {/* Minute */}
                        <input
                          type="number"
                          name="birthMinute"
                          value={formData.birthMinute}
                          onChange={handleInputChange}
                          placeholder={t('input.birthTime.minute')}
                          min="0"
                          max="59"
                          className={`w-full bg-white backdrop-blur-md border rounded-lg px-3 py-2 text-black focus:outline-none focus:border-white/30 transition-colors`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* City Search */}
                  <div className="space-y-4 w-full">
                    {/* City Search */}
                    <CitySearch
                      label={t('input.city.label')}
                      placeholder={t('input.city.placeholder')}
                      value={formData.city}
                      onChange={handleCitySelect}
                      error={cityAttempted && errors.city ? errors.city : undefined}
                      onInputChange={() => {
                        setCityAttempted(true);
                        setFormData(previous => ({ ...previous, city: '' }));
                      }}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      }
                    />

                    {/* Submit button - positioned at the bottom of the right column */}
                    <div className="pt-8 flex flex-col space-y-4">
                      {/* Single error message display */}
                      {cityAttempted && !isFormValid && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                          <p className="text-red-400 text-sm">
                            {t('input.error.general')}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={handleBackClick}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/80"
                        >
                          {t('input.back')}
                        </button>
                        
                        <button
                          type="submit"
                          disabled={!isFormValid}
                          className={`
                            px-8 py-3 rounded-full transition-all duration-300 transform
                            ${isFormValid 
                              ? 'bg-star-gold/20 hover:bg-star-gold/30 text-white/90 border border-star-gold/30 hover:border-star-gold/50 hover:scale-105' 
                              : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'}
                          `}
                        >
                          {t('input.submit')}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center py-1 text-white/25 font-extralight text-xs tracking-widest">
          <p>{t('main.footer')}</p>
        </footer>
      </div>
    </StarryBackground>
  );
};

export default InputPage;
