// src/pages/Home.jsx
import React, { useState } from 'react';

const Home = () => {
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [calculatorData, setCalculatorData] = useState({
    bmiWeight: '',
    bmiHeight: '',
    bpSys: '',
    bpDia: '',
    hrValue: '',
    calWeight: '',
    calHeight: '',
    calAge: '',
    calGender: 'male',
    waterWeight: '',
    sugarLevel: ''
  });
  const [calculatorResults, setCalculatorResults] = useState({});

  const healthTools = [
    {
      id: 1,
      name: 'Blood Pressure Checker',
      icon: '❤️',
      description: 'Monitor your blood pressure levels and get personalized recommendations.',
      color: 'from-red-500 to-pink-500',
      calculator: 'bp'
    },
    {
      id: 2,
      name: 'BMI Calculator',
      icon: '⚖️',
      description: 'Calculate your Body Mass Index and understand your weight category.',
      color: 'from-green-500 to-emerald-500',
      calculator: 'bmi'
    },
    {
      id: 3,
      name: 'Heart Rate Zone Finder',
      icon: '💓',
      description: 'Discover your optimal heart rate zones for different exercise intensities.',
      color: 'from-purple-500 to-indigo-500',
      calculator: 'hr'
    },
    {
      id: 4,
      name: 'Water Intake Tracker',
      icon: '💧',
      description: 'Track your daily water consumption and stay properly hydrated.',
      color: 'from-blue-500 to-cyan-500',
      calculator: 'water'
    },
    {
      id: 5,
      name: 'Diabetes Risk Assessment',
      icon: '🩸',
      description: 'Assess your risk for diabetes with our comprehensive screening tool.',
      color: 'from-orange-500 to-yellow-500',
      calculator: 'diabetes'
    },
    {
      id: 6,
      name: 'Calorie Calculator',
      icon: '🔥',
      description: 'Calculate your daily calorie needs based on your profile and activity level.',
      color: 'from-purple-500 to-pink-500',
      calculator: 'calories'
    }
  ];

  // Calculator functions
  const calcBMI = () => {
    const w = parseFloat(calculatorData.bmiWeight);
    const h = parseFloat(calculatorData.bmiHeight) / 100;
    if (w && h) {
      const bmi = (w / (h * h)).toFixed(1);
      const status = bmi < 18.5 ? "Underweight" : bmi < 24.9 ? "Normal" : bmi < 29.9 ? "Overweight" : "Obese";
      setCalculatorResults(prev => ({
        ...prev,
        bmi: `BMI: ${bmi} (${status})`
      }));
    }
  };

  const checkBP = () => {
    const sys = parseFloat(calculatorData.bpSys);
    const dia = parseFloat(calculatorData.bpDia);
    if (sys && dia) {
      const status = sys < 90 || dia < 60 ? "Low" : 
                    sys <= 120 && dia <= 80 ? "Normal" : 
                    sys <= 139 || dia <= 89 ? "Prehypertension" : "High";
      setCalculatorResults(prev => ({
        ...prev,
        bp: `BP Status: ${status} (${sys}/${dia} mmHg)`
      }));
    }
  };

  const checkHR = () => {
    const hr = parseFloat(calculatorData.hrValue);
    if (hr) {
      const status = hr < 60 ? "Below Normal (Bradycardia)" : 
                    hr <= 100 ? "Normal" : 
                    "High (Tachycardia)";
      const zone = hr < 60 ? "Resting" : 
                  hr <= 100 ? "Normal Range" : 
                  hr <= 150 ? "Fat Burning" : "High Intensity";
      setCalculatorResults(prev => ({
        ...prev,
        hr: `Heart Rate: ${status}\nZone: ${zone}`
      }));
    }
  };

  const calcCalories = () => {
    const w = parseFloat(calculatorData.calWeight);
    const h = parseFloat(calculatorData.calHeight);
    const a = parseFloat(calculatorData.calAge);
    const g = calculatorData.calGender;
    if (w && h && a) {
      const bmr = g === "male" ? 
        88.36 + (13.4 * w) + (4.8 * h) - (5.7 * a) : 
        447.6 + (9.2 * w) + (3.1 * h) - (4.3 * a);
      const maintenance = Math.round(bmr * 1.375);
      const weightLoss = Math.round(maintenance * 0.85);
      const weightGain = Math.round(maintenance * 1.15);
      
      setCalculatorResults(prev => ({
        ...prev,
        calories: `Maintenance: ${maintenance} cal/day\nWeight Loss: ${weightLoss} cal/day\nWeight Gain: ${weightGain} cal/day`
      }));
    }
  };

  const calcWater = () => {
    const w = parseFloat(calculatorData.waterWeight);
    if (w) {
      const intake = (w * 35); // in ml
      const cups = Math.round(intake / 250);
      setCalculatorResults(prev => ({
        ...prev,
        water: `Daily Water: ${(intake/1000).toFixed(2)} L\nApprox. ${cups} cups (250ml each)`
      }));
    }
  };

  const checkDiabetes = () => {
    const sugar = parseFloat(calculatorData.sugarLevel);
    if (sugar) {
      const status = sugar < 100 ? "Normal" : 
                    sugar <= 125 ? "Prediabetic" : 
                    "Diabetic (Consult Doctor)";
      setCalculatorResults(prev => ({
        ...prev,
        diabetes: `Fasting Blood Sugar: ${status}\nLevel: ${sugar} mg/dL`
      }));
    }
  };

  const handleInputChange = (calculator, field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculate = (calculator) => {
    switch (calculator) {
      case 'bmi':
        calcBMI();
        break;
      case 'bp':
        checkBP();
        break;
      case 'hr':
        checkHR();
        break;
      case 'calories':
        calcCalories();
        break;
      case 'water':
        calcWater();
        break;
      case 'diabetes':
        checkDiabetes();
        break;
      default:
        break;
    }
  };

  const resetCalculator = () => {
    setCalculatorData({
      bmiWeight: '',
      bmiHeight: '',
      bpSys: '',
      bpDia: '',
      hrValue: '',
      calWeight: '',
      calHeight: '',
      calAge: '',
      calGender: 'male',
      waterWeight: '',
      sugarLevel: ''
    });
    setCalculatorResults({});
  };

  const renderCalculatorModal = () => {
    if (!activeCalculator) return null;

    const tool = healthTools.find(t => t.calculator === activeCalculator);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`bg-gradient-to-r ${tool.color} p-6 rounded-t-2xl text-white`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{tool.name}</h2>
                <p className="text-white/90 text-sm mt-1">{tool.description}</p>
              </div>
              <button
                onClick={() => setActiveCalculator(null)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Calculator Content */}
          <div className="p-6">
            {renderCalculatorForm()}
            
            {/* Result Display */}
            {calculatorResults[activeCalculator] && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
                <p className="text-green-700 whitespace-pre-line">
                  {calculatorResults[activeCalculator]}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleCalculate(activeCalculator)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Calculate
              </button>
              <button
                onClick={resetCalculator}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalculatorForm = () => {
    switch (activeCalculator) {
      case 'bmi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={calculatorData.bmiWeight}
                onChange={(e) => handleInputChange('bmi', 'bmiWeight', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter weight in kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={calculatorData.bmiHeight}
                onChange={(e) => handleInputChange('bmi', 'bmiHeight', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter height in cm"
              />
            </div>
          </div>
        );

      case 'bp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Systolic Pressure (mm Hg)
              </label>
              <input
                type="number"
                value={calculatorData.bpSys}
                onChange={(e) => handleInputChange('bp', 'bpSys', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Upper number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diastolic Pressure (mm Hg)
              </label>
              <input
                type="number"
                value={calculatorData.bpDia}
                onChange={(e) => handleInputChange('bp', 'bpDia', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Lower number"
              />
            </div>
          </div>
        );

      case 'hr':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                value={calculatorData.hrValue}
                onChange={(e) => handleInputChange('hr', 'hrValue', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter heart rate"
              />
            </div>
          </div>
        );

      case 'calories':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={calculatorData.calWeight}
                  onChange={(e) => handleInputChange('calories', 'calWeight', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Weight"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={calculatorData.calHeight}
                  onChange={(e) => handleInputChange('calories', 'calHeight', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Height"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={calculatorData.calAge}
                  onChange={(e) => handleInputChange('calories', 'calAge', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={calculatorData.calGender}
                  onChange={(e) => handleInputChange('calories', 'calGender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'water':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={calculatorData.waterWeight}
                onChange={(e) => handleInputChange('water', 'waterWeight', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter weight in kg"
              />
            </div>
          </div>
        );

      case 'diabetes':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fasting Blood Sugar (mg/dL)
              </label>
              <input
                type="number"
                value={calculatorData.sugarLevel}
                onChange={(e) => handleInputChange('diabetes', 'sugarLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blood sugar level"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Health, Our 
              <span className="text-yellow-300"> Priority</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              World-class healthcare with compassion and cutting-edge technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveCalculator('bmi')}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                Check Your Health
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300">
                Emergency Help
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      {/* Health Tools Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Free Health Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Monitor your health with our interactive tools and stay on top of your wellness journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {healthTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
              >
                <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
                <div className="p-6">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {tool.description}
                  </p>
                  <button 
                    onClick={() => setActiveCalculator(tool.calculator)}
                    className="text-blue-600 font-semibold hover:text-blue-700 flex items-center space-x-2 group-hover:translate-x-2 transition-transform duration-300"
                  >
                    <span>Try Now</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Doctors</h3>
              <p className="text-gray-600">200+ specialized doctors with international experience</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚑</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Emergency</h3>
              <p className="text-gray-600">Round-the-clock emergency services with rapid response</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Technology</h3>
              <p className="text-gray-600">State-of-the-art medical equipment and digital solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Modal */}
      {renderCalculatorModal()}
    </div>
  );
};

export default Home;