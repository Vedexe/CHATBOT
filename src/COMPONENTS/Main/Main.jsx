import React, { useState } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = SpeechRecognition !== undefined;

const Main = () => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  const GEMINI_API_KEY = "AIzaSyBV2VhfkXbCBHsqGDhAnLwz2u4sjZwwTPM";
  const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const PIXABAY_API_KEY = "46055169-8096aa4d4c9e47c1f606d33f7"; // Free Pixabay API key (you can use this one or get your own)
  
  const fetchImagesFromPixabay = async (query, count = 3) => {
    try {
      const response = await axios.get(`https://pixabay.com/api/`, {
        params: {
          key: PIXABAY_API_KEY,
          q: query,
          image_type: 'photo',
          orientation: 'all',
          category: 'all',
          min_width: 300,
          min_height: 200,
          per_page: count,
          safesearch: 'true'
        }
      });
      
      if (response.data && response.data.hits && response.data.hits.length > 0) {
        return response.data.hits.map(img => ({
          url: img.webformatURL,
          alt: img.tags || query,
          photographer: img.user,
          source: 'pixabay',
          id: img.id
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching images from Pixabay:', error);
      return [];
    }
  };

  const fetchImagesFromLoremPicsum = (query, count = 3) => {
    return Array.from({ length: count }, (_, index) => ({
      url: `https://picsum.photos/400/300?random=${Date.now()}-${index}`,
      alt: `${query} - Random Image ${index + 1}`,
      photographer: 'Lorem Picsum',
      source: 'lorem-picsum',
      id: `${Date.now()}-${index}`
    }));
  };

  const fetchImagesFromPexels = async (query, count = 3) => {
    try {
      const response = await axios.get(`https://api.pexels.com/v1/search`, {
        headers: {
          'Authorization': 'YOUR_PEXELS_API_KEY'
        },
        params: {
          query: query,
          per_page: count
        }
      });
      
      if (response.data && response.data.photos && response.data.photos.length > 0) {
        return response.data.photos.map(photo => ({
          url: photo.src.medium,
          alt: photo.alt || query,
          photographer: photo.photographer,
          source: 'pexels',
          id: photo.id
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching images from Pexels:', error);
      return [];
    }
  };

  const fetchImagesFromMultipleSources = async (query, count = 3) => {
    let images = [];
    
    try {
      images = await fetchImagesFromPixabay(query, count);
      
      if (images.length === 0) {
        images = fetchImagesFromLoremPicsum(query, count);
      }
      
      return images;
    } catch (error) {
      console.error('Error fetching images from all sources:', error);
      return fetchImagesFromLoremPicsum(query, count);
    }
  };

  // NEW: Function to detect if user is asking for images
  const isImageRequest = (input) => {
    const imageKeywords = [
      'image', 'images', 'picture', 'pictures', 'photo', 'photos',
      'show me', 'generate image', 'create image', 'visual', 'illustration',
      'diagram', 'chart', 'graph', 'draw', 'sketch'
    ];
    return imageKeywords.some(keyword => input.toLowerCase().includes(keyword));
  };

  // NEW: Function to extract image query from user input
  const extractImageQuery = (input) => {
    // Remove common image request phrases and extract the main subject
    const cleanedInput = input
      .toLowerCase()
      .replace(/show me|generate|create|image|images|picture|pictures|photo|photos|of|a|an|the/g, '')
      .trim();
    return cleanedInput || 'abstract art';
  };

  const handleCardClick = (cardType) => {
    setGeneratedImages([]); // Clear previous images
    
    switch (cardType) {
      case 'best_courses':
        setAnswer(`- CSE: Computer Science and Engineering\n- IT: Information Technology\n- ECE: Electronics and Communication Engineering\n- EEE: Electrical and Electronics Engineering\n- ME: Mechanical Engineering\n- CE: Civil Engineering\n- AE: Aerospace Engineering\n- CH: Chemical Engineering\n- BT: Biotechnology\n- IE: Industrial Engineering\n- ICE: Instrumentation and Control Engineering\n- PE: Petroleum Engineering\n- MT: Metallurgical Engineering\n- Mining: Mining Engineering\n- Auto: Automobile Engineering\n- EnvE: Environmental Engineering\n- Marine: Marine Engineering`);
        break;
      case 'business_ideas':
        setAnswer(`🚛 1. Uber for Goods (Your Idea) – Local Truck Bidding Platform\nWhat: Local businesses post goods to deliver → nearby trucks bid in real time\n\nHow to start: Firebase backend + React Native app\n\nMoney: Commission (₹50–₹500 per delivery), paid plans for truckers\n\nWhy it works: No organized competition in tier-2/3 cities\n\n🏫 2. Local Tutor Booking App\nWhat: Tutors in your area list batches → students book seats/pay via app\n\nYou already teach, so you're the first user!\n\nMVP: Google Forms + WhatsApp → then React Native app\n\nRevenue: Subscription fee from teachers or ₹10/booking charge\n\n📦 3. Warehouse/Godown on Rent App\nWhat: List and book empty storage areas for local traders\n\nYour father's paper business can be an anchor partner\n\nPlatform: Simple map-based app (React + Google Maps API)\n\nEarn: Rent % + premium listing\n\n🧠 4. AI Bot Service for Small Shops\nWhat: You build & sell custom GPT-based chatbots for coaching, retailers, etc.\n\nTool: Botpress + OpenAI + Firebase\n\nClients: Your own tuition, local stores\n\nEarn: ₹299–₹999/month per bot\n\n🧃 5. Smart Food Trolley (QR-based)\nWhat: Local hostel/office tiffin or juice with QR scan → order → pay\n\nUse case: Campus, coaching centres\n\nTrack: Orders + payments via Google Sheets initially\n\nExpand: Add fridge sensors later (IoT)\n`);
        break;
      case 'travel_ideas':
        setAnswer(`🍃 1. Munnar, Kerala\nWhy: Misty tea gardens, waterfalls, and lush hills\n\nHighlights: Attukad Waterfalls, Eravikulam National Park\n\nMonsoon Vibe: Green carpets everywhere + fog = magical!\n\n🏞️ 2. Coorg (Kodagu), Karnataka\nWhy: Coffee estates + monsoon forests\n\nHighlights: Abbey Falls, Raja's Seat, Dubare Elephant Camp\n\nPerfect for: Peaceful solo trips or couples\n\n⛰️ 3. Lonavala-Khandala, Maharashtra\nWhy: Mumbai–Pune weekend favorite, filled with misty forts & waterfalls\n\nHighlights: Tiger Point, Bhushi Dam, Lohagad Fort\n\nBest With: Friends, bikes, and cutting chai ☕\n\n🌾 4. Valley of Flowers, Uttarakhand\nWhy: Opens only during monsoon, with 700+ species of blooming flowers\n\nUNESCO site\n\nIdeal for: Trekkers and nature lovers (mid-July to August is best)\n\n🏝️ 5. Agumbe, Karnataka\nWhy: Known as the "Cherrapunji of the South"\n\nHighlights: Rainforest trekking, sunset point, and King Cobra sightings\n\nPerfect for: Hardcore nature and wildlife lovers\n`);
        break;
      case 'dp_example':
        setAnswer(`💡 Problem: Fibonacci Numbers\nFind the Nth Fibonacci number where:\nF(0) = 0, F(1) = 1\nF(n) = F(n-1) + F(n-2) for n ≥ 2\n\nCODE:\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n\n    int dp[n+1];\n    dp[0] = 0;\n    dp[1] = 1;\n\n    for (int i = 2; i <= n; i++) {\n        dp[i] = dp[i-1] + dp[i-2];\n    }\n\n    return dp[n];\n}\n\nint main() {\n    int n = 10;\n    cout << "Fibonacci(" << n << ") = " << fibonacci(n) << endl;\n    return 0;\n}\n\`\`\``);
        break;
      default:
        setAnswer('Sorry, we could not find an answer to your query.');
    }
    setUserInput('');
  };

  const handlePromptChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) {
      alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setAnswer('');
      setGeneratedImages([]); // Clear previous images
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setAnswer(`Mic Error: ${event.error}. Please ensure your microphone is enabled.`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendClick = async () => {
    if (!userInput.trim()) {
      setAnswer('Please enter a query.');
      return;
    }

    setLoading(true);
    setAnswer('');
    setGeneratedImages([]); // Clear previous images

    try {
      // Check if user is requesting images
      if (isImageRequest(userInput)) {
        setImageLoading(true);
        const imageQuery = extractImageQuery(userInput);
        
        // Fetch images from multiple sources
        const images = await fetchImagesFromMultipleSources(imageQuery, 3);
        
        setGeneratedImages(images);
        setAnswer(`Here are some images related to "${imageQuery}":`);
        setImageLoading(false);
      } else {
        // Handle regular text queries
        if (userInput.toLowerCase().includes('why jisce')) {
          setAnswer(`Transparency and Information: The college aims to be transparent with prospective students and their families, providing comprehensive information about its programs, facilities, faculty, and other relevant aspects. This helps potential applicants make informed decisions.\nAttracting Students: Detailed information can showcase the college's strengths, achievements, and unique offerings, making it more appealing to prospective students.`);
        } else if (userInput.toLowerCase().includes('average fees') || userInput.toLowerCase().includes('fees')) {
          setAnswer(`Here are the approximate average fees for various streams at JISCE:\n\nStream: B.Tech → ₹4.08 Lakhs (Total)\nStream: B.Tech (Lateral) → ₹3.01 Lakhs (Total)\nStream: Polytechnic → ₹1.35 Lakhs (Total)\nStream: BCA → ₹2.4 Lakhs (Total)\nStream: BBA → ₹2.4 Lakhs (Total)\nStream: MBA → ₹4.98 Lakhs (Total)\nStream: M.Tech → ₹2.23 Lakhs (Total)\n\nNote: These are approximate average fees. Actual fees may vary depending on the specific course, specializations, and any additional charges. For the most accurate and up-to-date fee information, please visit the official JIS College of Engineering website or contact the college directly.`);
        } else if (userInput.toLowerCase().includes('location') || userInput.toLowerCase().includes('address') || userInput.toLowerCase().includes('where is jisce')) {
          setAnswer(`JIS College of Engineering is located at:\nBarrackpore - Kalyani Expy, Block A5, Block A, Kalyani, West Bengal 741235, India.`);
        } else {
          const payload = {
            contents: [{ role: "user", parts: [{ text: userInput }] }]
          };

          const response = await axios.post(API_ENDPOINT, payload, {
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.data && response.data.candidates && response.data.candidates.length > 0 &&
              response.data.candidates[0].content && response.data.candidates[0].content.parts &&
              response.data.candidates[0].content.parts.length > 0) {
            setAnswer(response.data.candidates[0].content.parts[0].text);
          } else {
            setAnswer('No relevant response from the AI.');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
      setAnswer('Failed to get a response. Please try again later.');
    } finally {
      setLoading(false);
      setImageLoading(false);
      setUserInput('');
    }
  };

  return (
    <div className='main'>
      <div className="nav">
        <p>PERSONAL CHATBOT</p>
        <img src={assets.user_icon} alt="User Icon" />
      </div>
      <div className="main-container">
        <div className="greet">
          <p><span>Hello, User.</span></p>
          <p>How can I help you today?</p>
        </div>

        <div className="main-bottom">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder={isListening ? 'Listening...' : 'Enter a prompt here (try "show me images of cats")'}
              value={userInput}
              onChange={handlePromptChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendClick();
                }
              }}
            />
            <div className="search-icons">
              <img src={assets.gallery_icon} alt="Gallery" />
              <img
                src={assets.mic_icon}
                alt="Microphone"
                className="mic-icon"
                onClick={handleMicClick}
                style={{ cursor: isSpeechRecognitionSupported ? 'pointer' : 'not-allowed' }}
              />
              <img
                src={assets.send_icon}
                alt="Send"
                className="send-icon"
                onClick={handleSendClick}
              />
            </div>
          </div>
          
          <div className="loading-container">
            {(loading || imageLoading) && (
              <div className="sidebar-loading">
                <div className="spinner"></div>
                <p>{imageLoading ? 'Generating images...' : 'Loading...'}</p>
              </div>
            )}
            {isListening && !loading && (
                <p className="listening-text">Listening... Please speak clearly.</p>
            )}
          </div>
          
          <div className="bottom-info" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {!loading && answer && <ReactMarkdown>{answer}</ReactMarkdown>}
          </div>

          {/* NEW: Image gallery section */}
          {generatedImages.length > 0 && (
            <div className="image-gallery" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px',
              padding: '20px 0'
            }}>
              {generatedImages.map((image, index) => (
                <div key={index} className="image-container" style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#f9f9f9',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease'
                }}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    padding: '12px',
                    textAlign: 'center',
                    backgroundColor: 'white'
                  }}>
                    <p style={{
                      margin: '0',
                      fontSize: '14px',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      {image.source === 'pixabay' ? `Photo by ${image.photographer} on Pixabay` : 
                       image.source === 'lorem-picsum' ? 'Random photo from Lorem Picsum' :
                       image.source === 'pexels' ? `Photo by ${image.photographer} on Pexels` :
                       `Photo by ${image.photographer}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cards">
          <div className="card" onClick={() => handleCardClick('best_courses')}>
            <p>Suggest Best courses for B.Tech</p>
            <img src={assets.compass_icon} alt="Compass Icon" />
          </div>
          <div className="card" onClick={() => handleCardClick('business_ideas')}>
            <p>Give some business ideas</p>
            <img src={assets.bulb_icon} alt="Bulb Icon" />
          </div>
          <div className="card" onClick={() => handleCardClick('travel_ideas')}>
            <p>Give travel ideas in monsoon</p>
            <img src={assets.message_icon} alt="Message Icon" />
          </div>
          <div className="card" onClick={() => handleCardClick('dp_example')}>
            <p>Give dynamic programming example</p>
            <img src={assets.code_icon} alt="Code Icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;