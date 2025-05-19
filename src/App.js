import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import './App.css';
import ArduinoBridge from './arduinoBridge';

function App() {
  // State variables
  const [currentStep, setCurrentStep] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [animation, setAnimation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('nl'); // Default to Dutch
  const [showQR, setShowQR] = useState(false); // State to show/hide QR code
  const [backgroundColor, setBackgroundColor] = useState(null); // For background color
  const [arduinoConnected, setArduinoConnected] = useState(false);
  
  // State variables for background animation
  const [backgroundActive, setBackgroundActive] = useState(false);
  const [animatingBackground, setAnimatingBackground] = useState(false);
  
  // Arduino bridge reference
  const arduinoBridgeRef = useRef(null);
  
  // Initialize Arduino bridge
  useEffect(() => {
    arduinoBridgeRef.current = new ArduinoBridge();
    
    // Clean up on unmount
    return () => {
      if (arduinoBridgeRef.current && arduinoConnected) {
        arduinoBridgeRef.current.disconnect();
      }
    };
  }, [arduinoConnected]);
  
  // Content for the app
  const content = {
    nl: {
      title: 'Electio',
      subtitle: 'Ontdek je morele kompas',
      startButton: 'Begin de Ervaring',
      nextButton: 'Volgende',
      backButton: 'Ga Terug',
      resultButton: 'Ontdek Je Morele Kompas',
      restartButton: 'Opnieuw Beginnen',
      introText: 'Welkom bij Electio, een interactieve installatie die je helpt je morele kompas te ontdekken. Je krijgt 12 dilemma\'s voorgeschoteld die studenten vaak tegenkomen. Jouw keuzes onthullen welk type beslisser je bent.',
      shareText: 'Deel je resultaat',
      languageButton: 'Switch to English',
      progressText: 'Dilemma',
      of: 'van',
      closeQR: 'Sluiten',
      qrTitle: 'Scan deze QR-code om je resultaat te delen',
    },
    en: {
      title: 'Electio',
      subtitle: 'Discover your moral compass',
      startButton: 'Start the Experience',
      nextButton: 'Next',
      backButton: 'Go Back',
      resultButton: 'Discover Your Moral Compass',
      restartButton: 'Start Again',
      introText: 'Welcome to Electio, an interactive installation that helps you discover your moral compass. You will be presented with 12 dilemmas that students often face. Your choices will reveal what type of decision-maker you are.',
      shareText: 'Share your result',
      languageButton: 'Wissel naar Nederlands',
      progressText: 'Dilemma',
      of: 'of',
      closeQR: 'Close',
      qrTitle: 'Scan this QR code to share your result',
    }
  };

  // Dilemmas in Dutch and English
  const dilemmas = {
    nl: [
      {
        question: 'Je hebt een groepswerk, maar één groepslid doet niets. De deadline nadert. Wat doe je?',
        options: [
          'Je doet het werk zelf, zodat jullie een goede score halen.',
          'Je meldt het aan de docent, ook al betekent dat een slechtere groepssfeer.',
          'Je confronteert de persoon en vertelt hen dat ze moeten bijdragen.'
        ],
        category: 'studie'
      },
      {
        question: 'Je krijgt per ongeluk toegang tot de examenvragen vóór de test. Niemand zal het weten. Wat doe je?',
        options: [
          'Je gebruikt ze en zorgt ervoor dat je een topscore haalt.',
          'Je negeert ze – je wil eerlijk slagen.',
          'Je deelt ze met vrienden zodat iedereen profiteert.'
        ],
        category: 'studie'
      },
      {
        question: 'Je krijgt een stage aangeboden bij een topbedrijf in jouw sector, maar het betekent dat je je huidige studentenjob moet opgeven, waardoor je financiële situatie krapper wordt. Wat doe je?',
        options: [
          'Je neemt de stage aan - ervaring is belangrijker dan geld.',
          'Je weigert de stage - je hebt het inkomen nodig om rond te komen.',
          'Je probeert een compromis te vinden, zoals minder werken in je studentenjob of extra financiële steun zoeken.'
        ],
        category: 'carrière'
      },
      {
        question: 'Je kotgenoot gebruikt constant jouw spullen zonder te vragen. Wat doe je?',
        options: [
          'Je confronteert hen direct en stelt duidelijke regels op.',
          'Je doet hetzelfde terug – als zij jouw dingen gebruiken, gebruik jij die van hen.',
          'Je laat het gaan en zegt er niets van om conflicten te vermijden.'
        ],
        category: 'sociaal'
      },
      {
        question: 'Je vrienden willen uitgaan, maar jij hebt morgen een belangrijk examen. Wat doe je?',
        options: [
          'Je gaat mee – je leeft maar één keer!',
          'Je blijft thuis en studeert – je wil slagen.',
          'Je gaat mee, maar belooft jezelf om vroeg naar huis te gaan.'
        ],
        category: 'sociaal'
      },
      {
        question: 'Een vriend leent geld van je en betaalt het niet terug. Wat doe je?',
        options: [
          'Je spreekt hen erop aan en vraagt je geld terug.',
          'Je laat het gaan – het is maar geld, en je wil de vriendschap niet op het spel zetten.',
          'Je leent hen nooit meer iets, maar zegt er niets over.'
        ],
        category: 'sociaal'
      },
      {
        question: 'Je ziet iemand op straat in nood, maar je hebt haast om naar een belangrijke les te gaan. Wat doe je?',
        options: [
          'Je stopt en helpt, ook al kom je te laat.',
          'Je loopt door – je hebt geen tijd voor dit.',
          'Je belt hulpdiensten, maar loopt verder.'
        ],
        category: 'ethisch'
      },
      {
        question: 'Je kunt een petitie tekenen voor een goed doel, maar je weet er niet veel over. Wat doe je?',
        options: [
          'Je tekent – elke steun telt!',
          'Je leest eerst meer info voordat je beslist.',
          'Je doet niets – het is niet jouw probleem.'
        ],
        category: 'ethisch'
      },
      {
        question: 'Op een feestje hoor je iemand een discriminerende opmerking maken. Wat doe je?',
        options: [
          'Je spreekt hen erop aan, zelfs als dat ongemakkelijk is.',
          'Je negeert het – je wil geen drama veroorzaken.',
          'Je maakt achteraf een opmerking naar je vrienden, maar zegt niets tegen de persoon zelf.'
        ],
        category: 'ethisch'
      },
      {
        question: 'Je krijgt de kans om een extra vak te volgen dat je écht interesseert, maar het betekent meer werk. Wat doe je?',
        options: [
          'Je schrijft je in – passie is belangrijker dan gemak.',
          'Je doet het niet – je wil niet overbelast raken.',
          'Je kiest voor een vak dat makkelijk punten oplevert.'
        ],
        category: 'persoonlijk'
      },
      {
        question: 'Je krijgt een aanbod voor een goedbetaalde bijbaan, maar het is saai en niet relevant voor je studie. Wat doe je?',
        options: [
          'Je neemt het – geld is geld.',
          'Je zoekt verder naar iets dat bij je interesses past.',
          'Je neemt de job tijdelijk, maar blijft zoeken naar iets beters.'
        ],
        category: 'carrière'
      },
      {
        question: 'Je hebt de kans om naar het buitenland te gaan voor een semester, maar je moet veel achterlaten. Wat doe je?',
        options: [
          'Je gaat – een nieuwe ervaring is het waard.',
          'Je blijft – je hebt hier al alles wat je nodig hebt.',
          'Je twijfelt en stelt de beslissing uit tot het laatste moment.'
        ],
        category: 'persoonlijk'
      }
    ],
    en: [
      {
        question: 'You have group work, but one member isn\'t contributing anything. The deadline is approaching. What do you do?',
        options: [
          'You do the work yourself to ensure a good grade.',
          'You report it to the teacher, even if it creates tension in the group.',
          'You confront the person and try to find a solution together.'
        ],
        category: 'study'
      },
      {
        question: 'You accidentally gain access to exam questions before the test. No one will know. What do you do?',
        options: [
          'You use them and ensure you get a top score.',
          'You ignore them - you want to succeed honestly.',
          'You share them with friends so everyone benefits.'
        ],
        category: 'study'
      },
      {
        question: 'You are offered an internship at a top company in your field, but it means giving up your current student job, making your financial situation tighter. What do you do?',
        options: [
          'You accept the internship - experience is more important than money.',
          'You decline the internship - you need the income to make ends meet.',
          'You try to find a compromise, like working fewer hours at your student job or seeking additional financial support.'
        ],
        category: 'career'
      },
      {
        question: 'Your roommate constantly uses your things without asking. What do you do?',
        options: [
          'You confront them directly and establish clear rules.',
          'You do the same in return - if they use your things, you use theirs.',
          'You let it go and say nothing to avoid conflicts.'
        ],
        category: 'social'
      },
      {
        question: 'Your friends want to go out, but you have an important exam tomorrow. What do you do?',
        options: [
          'You go along - you only live once!',
          'You stay home and study - you want to succeed.',
          'You go along but promise yourself to return home early.'
        ],
        category: 'social'
      },
      {
        question: 'A friend borrows money from you and doesn\'t pay it back. What do you do?',
        options: [
          'You confront them and ask for your money back.',
          'You let it go - it\'s just money, and you don\'t want to risk the friendship.',
          'You never lend them anything again but don\'t say anything about it.'
        ],
        category: 'social'
      },
      {
        question: 'You see someone in need on the street, but you\'re in a hurry to get to an important class. What do you do?',
        options: [
          'You stop and help, even if it means you\'ll be late.',
          'You walk on - you don\'t have time for this.',
          'You call emergency services but continue walking.'
        ],
        category: 'ethical'
      },
      {
        question: 'You can sign a petition for a good cause, but you don\'t know much about it. What do you do?',
        options: [
          'You sign it - every bit of support counts!',
          'You read more information before deciding.',
          'You do nothing - it\'s not your problem.'
        ],
        category: 'ethical'
      },
      {
        question: 'At a party, you hear someone make a discriminatory remark. What do you do?',
        options: [
          'You call them out on it, even if it\'s uncomfortable.',
          'You ignore it - you don\'t want to cause drama.',
          'You make a comment to your friends afterwards but say nothing to the person directly.'
        ],
        category: 'ethical'
      },
      {
        question: 'You get the chance to take an extra course that really interests you, but it means more work. What do you do?',
        options: [
          'You sign up - passion is more important than convenience.',
          'You don\'t do it - you don\'t want to be overloaded.',
          'You choose a course that easily yields points.'
        ],
        category: 'personal'
      },
      {
        question: 'You\'re offered a well-paid side job, but it\'s boring and not relevant to your studies. What do you do?',
        options: [
          'You take it - money is money.',
          'You keep looking for something that matches your interests.',
          'You take the job temporarily but keep looking for something better.'
        ],
        category: 'career'
      },
      {
        question: 'You have the opportunity to go abroad for a semester, but you have to leave a lot behind. What do you do?',
        options: [
          'You go - a new experience is worth it.',
          'You stay - you already have everything you need here.',
          'You hesitate and postpone the decision until the last moment.'
        ],
        category: 'personal'
      }
    ]
  };

  // Profiles with enhanced colors for more vibrancy
  const profiles = {
    nl: {
      idealist: {
        title: "De Idealist – Jij bent de morele kompasdrager",
        description: "Jouw keuzes tonen dat je altijd handelt vanuit principes. Je zet eerlijkheid en rechtvaardigheid op de eerste plaats, zelfs als dat betekent dat je moeilijke beslissingen moet nemen. Of het nu gaat om eerlijk studeren, mensen helpen of je idealen volgen, je kiest altijd voor het grotere goed. Maar pas op: soms kan je idealisme je in conflict brengen met de realiteit.",
        traits: "Eerlijk, rechtvaardig, betrokken, ambitieus",
        color: "#66BB6A" // Brighter green
      },
      loyalist: {
        title: "De Loyalist – Jij bent de beschermer van je groep",
        description: "Jij kiest altijd voor je vrienden en de mensen om je heen. Of het nu gaat om je kotgenoot, een vriend in nood of een moeilijke groepsopdracht – je prioriteit ligt bij loyaliteit en samenhorigheid. Je denkt na over wat het beste is voor de groep, zelfs als dat betekent dat je eigen belangen soms opzij worden geschoven.",
        traits: "Sociaal, zorgzaam, teamplayer, conflictvermijdend",
        color: "#42A5F5" // Brighter blue
      },
      pragmatist: {
        title: "De Pragmaticus – Jij kiest wat werkt",
        description: "Voor jou draait alles om efficiëntie en slimme keuzes. Je denkt praktisch na en kiest altijd de optie die jou het meeste voordeel oplevert – of dat nu in je studie, sociale leven of carrière is. Dit maakt je doortastend en succesvol, maar soms kunnen anderen je keuzes als hard of berekend ervaren.",
        traits: "Doelgericht, realistisch, rationeel, strategisch",
        color: "#FFA726" // Brighter orange
      },
      individualist: {
        title: "De Individualist – Jij volgt je eigen pad",
        description: "Jij laat je niet beïnvloeden door verwachtingen van anderen – je maakt keuzes op basis van wat jij het belangrijkst vindt. Je hebt een sterke persoonlijkheid en volgt je eigen visie, zelfs als dat betekent dat je soms tegen de stroom in gaat. Je bent onafhankelijk en authentiek, maar let op dat je geen belangrijke connecties verliest door altijd je eigen weg te kiezen.",
        traits: "Onafhankelijk, zelfverzekerd, ambitieus, rebels",
        color: "#AB47BC" // Brighter purple
      }
    }, 
    en: {
      idealist: {
        title: "The Idealist – You are the moral compass bearer",
        description: "Your choices show that you always act based on principles. You put honesty and justice first, even if that means making difficult decisions. Whether it's studying honestly, helping people, or following your ideals, you always choose the greater good. But be careful: sometimes your idealism can bring you into conflict with reality.",
        traits: "Honest, fair, engaged, ambitious",
        color: "#66BB6A" // Brighter green
      },
      loyalist: {
        title: "The Loyalist – You are the protector of your group",
        description: "You always choose your friends and the people around you. Whether it's your roommate, a friend in need, or a difficult group assignment - your priority lies with loyalty and togetherness. You think about what's best for the group, even if it means your own interests sometimes take a back seat.",
        traits: "Social, caring, team player, conflict-avoiding",
        color: "#42A5F5" // Brighter blue
      },
      pragmatist: {
        title: "The Pragmatist – You choose what works",
        description: "For you, everything revolves around efficiency and smart choices. You think practically and always choose the option that brings you the most benefit - whether in your studies, social life, or career. This makes you decisive and successful, but sometimes others may perceive your choices as hard or calculated.",
        traits: "Goal-oriented, realistic, rational, strategic",
        color: "#FFA726" // Brighter orange
      },
      individualist: {
        title: "The Individualist – You follow your own path",
        description: "You don't let yourself be influenced by others' expectations - you make choices based on what you find most important. You have a strong personality and follow your own vision, even if it means sometimes going against the flow. You're independent and authentic, but be careful not to lose important connections by always choosing your own way.",
        traits: "Independent, confident, ambitious, rebellious",
        color: "#AB47BC" // Brighter purple
      }
    }
  };

  // Function to determine profile based on answers
  const determineProfile = () => {
    let idealistScore = 0;
    let loyalistScore = 0;  
    let pragmatistScore = 0;
    let individualistScore = 0;

    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionIndex, answerIndex]) => {
      // Get the actual category from the dilemma
      const currentDilemma = dilemmas[language][parseInt(questionIndex)];
      const category = currentDilemma.category;
      
      if (answerIndex === 0) {
        // Option A tendencies
        switch (category) {
          case 'studie':
          case 'study':
            loyalistScore++;
            break;
          case 'ethisch':
          case 'ethical':
            idealistScore++;
            break;
          case 'carrière':
          case 'career':
            pragmatistScore++;
            break;
          case 'sociaal':
          case 'social':
            individualistScore++;
            break;
          case 'persoonlijk':
          case 'personal':
            individualistScore++;
            break;
          default:
            break;
        }
      } else if (answerIndex === 1) {
        // Option B tendencies
        switch (category) {
          case 'studie':
          case 'study':
            idealistScore++;
            break;
          case 'ethisch':
          case 'ethical':
            pragmatistScore++;
            break;
          case 'carrière':
          case 'career':
            individualistScore++;
            break;
          case 'sociaal':
          case 'social':
            loyalistScore++;
            break;
          case 'persoonlijk':
          case 'personal':
            loyalistScore++;
            break;
          default:
            break;
        }
      } else if (answerIndex === 2) {
        // Option C tendencies
        switch (category) {
          case 'studie':
          case 'study':
            pragmatistScore++;
            break;
          case 'ethisch':
          case 'ethical':
            loyalistScore++;
            break;
          case 'carrière':
          case 'career':
            idealistScore++;
            break;
          case 'sociaal':
          case 'social':
            individualistScore++;
            break;
          case 'persoonlijk':
          case 'personal':
            pragmatistScore++;
            break;
          default:
            break;
        }
      }
    });

    // Determine dominant profile
    const scores = {
      idealist: idealistScore,
      loyalist: loyalistScore,
      pragmatist: pragmatistScore,
      individualist: individualistScore
    };

    // Find highest score (in case of tie, first one is chosen)
    const dominantProfile = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // Also calculate percentage scores for visualization
    const totalScore = idealistScore + loyalistScore + pragmatistScore + individualistScore;
    const percentages = {
      idealist: Math.round((idealistScore / totalScore) * 100),
      loyalist: Math.round((loyalistScore / totalScore) * 100),
      pragmatist: Math.round((pragmatistScore / totalScore) * 100),
      individualist: Math.round((individualistScore / totalScore) * 100)
    };

    return {
      profile: dominantProfile,
      scores: percentages
    };
  };

  // Function to determine the answer profile type
  const getAnswerProfileType = (questionIndex, answerIndex) => {
    const currentDilemma = dilemmas[language][questionIndex];
    const category = currentDilemma.category;
    
    if (answerIndex === 0) {
      // Option A tendencies
      switch (category) {
        case 'studie':
        case 'study':
          return 'loyalist';
        case 'ethisch':
        case 'ethical':
          return 'idealist';
        case 'carrière':
        case 'career':
          return 'pragmatist';
        case 'sociaal':
        case 'social':
          return 'individualist';
        case 'persoonlijk':
        case 'personal':
          return 'individualist';
        default:
          return null;
      }
    } else if (answerIndex === 1) {
      // Option B tendencies
      switch (category) {
        case 'studie':
        case 'study':
          return 'idealist';
        case 'ethisch':
        case 'ethical':
          return 'pragmatist';
        case 'carrière':
        case 'career':
          return 'individualist';
        case 'sociaal':
        case 'social':
          return 'loyalist';
        case 'persoonlijk':
        case 'personal':
          return 'loyalist';
        default:
          return null;
      }
    } else if (answerIndex === 2) {
      // Option C tendencies
      switch (category) {
        case 'studie':
        case 'study':
          return 'pragmatist';
        case 'ethisch':
        case 'ethical':
          return 'loyalist';
        case 'carrière':
        case 'career':
          return 'idealist';
        case 'sociaal':
        case 'social':
          return 'individualist';
        case 'persoonlijk':
        case 'personal':
          return 'pragmatist';
        default:
          return null;
      }
    }
    
    return null;
  };
  
  // Function to send color value to Arduino
  const sendColorToArduino = (color) => {
    // Log the color for demonstration
    console.log('Sending color to Arduino:', color);
    
    // If Arduino is connected, send the color
    if (arduinoBridgeRef.current && arduinoConnected) {
      arduinoBridgeRef.current.sendColor(color);
    }
  };
  
  // Function to connect to Arduino
  const connectToArduino = async () => {
    if (arduinoBridgeRef.current) {
      if (arduinoBridgeRef.current.isSupported()) {
        const connected = await arduinoBridgeRef.current.connect();
        setArduinoConnected(connected);
        
        // If connected and we have a background color, send it
        if (connected && backgroundColor) {
          sendColorToArduino(backgroundColor);
        }
        
        return connected;
      } else {
        console.log('Web Serial API not supported in this browser');
        return false;
      }
    }
    return false;
  };

  const createShareableURL = () => {
    if (!result) return '';
    
    // Add a URL scheme to force browser opening
    const baseUrl = "https://192.168.203.170:3000"; // Consider using HTTPS if possible
    
    const params = new URLSearchParams({
      profile: result.profile,
      lang: language,
      idealist: result.scores.idealist,
      loyalist: result.scores.loyalist,
      pragmatist: result.scores.pragmatist,
      individualist: result.scores.individualist
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  // UPDATED: Handle answer selection with improved animation transitions
  const handleAnswer = (answerIndex) => {
    setAnimation(true);
    
    // Update answers with current selection
    const currentDilemmaIndex = Object.keys(answers).length;
    const updatedAnswers = { ...answers, [currentDilemmaIndex]: answerIndex };
    setAnswers(updatedAnswers);
    
    // Determine the profile type for this answer
    const profileType = getAnswerProfileType(currentDilemmaIndex, answerIndex);
    
    // Set background color based on profile and activate animation
    if (profileType) {
      const profileColor = profiles[language][profileType].color;
      setBackgroundColor(profileColor);
      
      // Clear any existing timeouts to prevent conflicts
      if (window.fadeTimeout) clearTimeout(window.fadeTimeout);
      if (window.fadeOutTimeout) clearTimeout(window.fadeOutTimeout);
      
      // Start fade-in immediately
      setAnimatingBackground(true);
      setBackgroundActive(true);
      
      // Send color to Arduino
      sendColorToArduino(profileColor);
      
      // Schedule fade-out after 2 seconds of display time
      window.fadeTimeout = setTimeout(() => {
        // Start fade-out
        setBackgroundActive(false);
        
        // Complete animation cycle after the fade-out finishes
        window.fadeOutTimeout = setTimeout(() => {
          setAnimatingBackground(false);
        }, 1000); // Wait for the full fade-out transition (1s)
      }, 2000); // Show for 2 seconds before starting fade-out
    }
    
    // After delay for the full animation cycle, move to next question or results
    setTimeout(() => {
      setAnimation(false);
      
      if (currentDilemmaIndex + 1 >= dilemmas[language].length) {
        // All questions answered, show results
        const profileResult = determineProfile();
        setResult(profileResult);
        setCurrentStep('result');
        
        // For the final result, keep the background color persistent
        const finalProfileColor = profiles[language][profileResult.profile].color;
        setBackgroundColor(finalProfileColor);
        setBackgroundActive(true); // Keep the background active
        setAnimatingBackground(false); // No more animation needed
        sendColorToArduino(finalProfileColor);
      } else {
        // Update progress
        setProgress(currentDilemmaIndex + 1);
      }
    }, 3000); // Wait for the full animation cycle
  };

  // UPDATED: Handle going back with improved animation
  const handleGoBack = () => {
    if (progress > 0) {
      // Remove the last answer
      const updatedAnswers = { ...answers };
      delete updatedAnswers[progress - 1];
      setAnswers(updatedAnswers);
      
      // Go back to previous question
      setProgress(progress - 1);
      
      // Update background color based on the previous answer if any
      if (Object.keys(updatedAnswers).length > 0) {
        const lastQuestionIndex = Math.max(...Object.keys(updatedAnswers).map(Number));
        const lastAnswer = updatedAnswers[lastQuestionIndex];
        const profileType = getAnswerProfileType(lastQuestionIndex, lastAnswer);
        
        if (profileType) {
          const profileColor = profiles[language][profileType].color;
          setBackgroundColor(profileColor);
          
          // Clear any existing timeouts to prevent conflicts
          if (window.fadeTimeout) clearTimeout(window.fadeTimeout);
          if (window.fadeOutTimeout) clearTimeout(window.fadeOutTimeout);
          
          // Start fade-in immediately
          setAnimatingBackground(true);
          setBackgroundActive(true);
          
          sendColorToArduino(profileColor);
          
          // Schedule fade-out after 2 seconds of display time
          window.fadeTimeout = setTimeout(() => {
            // Start fade-out
            setBackgroundActive(false);
            
            // Complete animation cycle after the fade-out finishes
            window.fadeOutTimeout = setTimeout(() => {
              setAnimatingBackground(false);
            }, 1000); // Wait for the full fade-out transition (1s)
          }, 2000); // Show for 2 seconds before starting fade-out
        }
      } else {
        // Reset color if no answers
        setBackgroundColor(null);
        setBackgroundActive(false);
        sendColorToArduino('#121212'); // Default dark background
      }
    }
  };

  // Handle restart
  const handleRestart = () => {
    setAnswers({});
    setResult(null);
    setCurrentStep('intro');
    setProgress(0);
    setShowQR(false);
    setBackgroundColor(null);
    setBackgroundActive(false);
    setAnimatingBackground(false);
    sendColorToArduino('#121212'); // Reset to default color
  };

  // Handle language toggle
  const toggleLanguage = () => {
    setLanguage(language === 'nl' ? 'en' : 'nl');
  };

  // Handle share button click
  const handleShare = () => {
    setShowQR(true);
  };
  
  // UPDATED: useEffect for background transitions
  useEffect(() => {
    // Only manipulate background when there's an active animation or on the results page
    if (animatingBackground || (result && currentStep === 'result')) {
      // Always set the transition property
      document.body.style.transition = 'background 1s ease-in-out';
    }
    
    // Special case for results page - keep the background with more vibrant color
    if (result && currentStep === 'result') {
      document.body.style.transition = 'background 1s ease-in-out';
      document.body.style.background = `radial-gradient(circle at top right, ${backgroundColor}66 0%, #0D0D0D 70%)`;
    }
    
    // Cleanup function
    return () => {
      document.body.style.background = '';
      document.body.style.transition = '';
    };
  }, [backgroundColor, backgroundActive, animatingBackground, result, currentStep]);

  // Effect to initialize progress when starting questions
  useEffect(() => {
    if (currentStep === 'questions' && progress === 0) {
      setProgress(0);
    }
  }, [currentStep, progress]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (window.fadeTimeout) clearTimeout(window.fadeTimeout);
      if (window.fadeOutTimeout) clearTimeout(window.fadeOutTimeout);
    };
  }, []);

  // Determine profile class based on background color
  const getProfileClass = () => {
    if (!backgroundColor) return '';
    
    // Match the color to the profile
    switch (backgroundColor) {
      case '#66BB6A': return 'idealist-bg';
      case '#42A5F5': return 'loyalist-bg';
      case '#FFA726': return 'pragmatist-bg';
      case '#AB47BC': return 'individualist-bg';
      default: return '';
    }
  };

  return (
    <div className={`app ${getProfileClass()} ${backgroundActive ? 'bg-active' : ''}`}>
      {/* Add color overlay for background transitions */}
      <div 
        className={`color-overlay ${backgroundActive ? 'active' : ''}`}
        style={{ 
          background: backgroundColor ? 
            `radial-gradient(circle at top right, ${backgroundColor}66 0%, rgba(13, 13, 13, 0) 70%)` : 
            'transparent'
        }}
      ></div>
      
      <header>
        <h1><a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>{content[language].title}</a></h1>
        <h2>{content[language].subtitle}</h2>
        <button onClick={toggleLanguage} className="language-toggle">
          {content[language].languageButton}
        </button>
        {!arduinoConnected && (
          <button 
            onClick={connectToArduino} 
            className="secondary-button"
            style={{ position: 'absolute', top: '1rem', left: '1rem' }}
          >
            Connect LED Panel
          </button>
        )}
      </header>

      <main className={`main ${animation ? 'animate' : ''}`}>
        {currentStep === 'intro' && (
          <div className="intro-screen">
            <p>{content[language].introText}</p>
            <button 
              onClick={() => setCurrentStep('questions')} 
              className="primary-button"
            >
              {content[language].startButton}
            </button>
          </div>
        )}

        {currentStep === 'questions' && (
          <div className="question-screen">
            <div className="progress-bar">
              <div className="progress-text">
                {content[language].progressText} {progress + 1} {content[language].of} {dilemmas[language].length}
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((progress + 1) / dilemmas[language].length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="question">
              <h3>{dilemmas[language][progress].question}</h3>
              
              <div className="options">
                {dilemmas[language][progress].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="option-button"
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* Back button - only show if not on first question */}
              {progress > 0 && (
                <button 
                  onClick={handleGoBack} 
                  className="secondary-button back-button"
                >
                  {content[language].backButton}
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'result' && result && (
          <div className={`result-screen ${showQR ? 'qr-active' : ''}`}>
            <h2 style={{ color: profiles[language][result.profile].color }}>
              {profiles[language][result.profile].title}
            </h2>
            
            <p>{profiles[language][result.profile].description}</p>
            
            <div className="traits">
              <strong>{profiles[language][result.profile].traits}</strong>
            </div>
            
            <div className="score-chart">
              {Object.keys(result.scores).map((profile) => (
                <div key={profile} className="score-bar-container">
                  <div className="score-label">
                    <span>{profile}</span>
                    <span>{result.scores[profile]}%</span>
                  </div>
                  <div className="score-bar-wrapper">
                    <div 
                      className={`score-bar ${profile}-bar`}
                      style={{ 
                        width: `${result.scores[profile]}%`,
                        backgroundColor: profiles[language][profile].color
                      }}
                    >
                      <span className={`score-value ${result.scores[profile] > 0 ? 'active' : ''}`}>
                        {result.scores[profile]}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="result-actions">
              <button onClick={handleRestart} className="secondary-button">
                {content[language].restartButton}
              </button>
              <button onClick={handleShare} className="primary-button share-button">
                {content[language].shareText}
              </button>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQR && (
          <div className="qr-modal-overlay">
            <div className="qr-modal">
              <h3>{content[language].qrTitle}</h3>
              <div className="qr-code-container">
                <QRCode 
                  value={createShareableURL()} 
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <button onClick={() => setShowQR(false)} className="secondary-button">
                {content[language].closeQR}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;