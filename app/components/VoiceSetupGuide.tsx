"use client";
import { useState, useEffect } from "react";
import { getDeviceType } from "../utils/speech";

interface VoiceSetupGuideProps {
  onClose: () => void;
}

const VoiceSetupGuide = ({ onClose }: VoiceSetupGuideProps) => {
  const [deviceType, setDeviceType] = useState<string>('');

  useEffect(() => {
    setDeviceType(getDeviceType());
  }, []);

  const getInstructions = () => {
    switch (deviceType) {
      case 'windows':
        return {
          title: "Install British English Voice on Windows",
          steps: [
            "Open Settings (Windows key + I)",
            "Go to Time & Language → Speech",
            "Click 'Add voices'",
            "Search for and download 'English (United Kingdom)'",
            "Look for voices like 'Hazel' or 'George'",
            "Restart your browser after installation"
          ],
          alternativeSteps: [
            "Alternative: Go to Settings → Accessibility → Narrator",
            "Click 'Add more voices'",
            "Download British English voices"
          ]
        };

      case 'mac':
        return {
          title: "Install British English Voice on Mac",
          steps: [
            "Open System Preferences",
            "Go to Accessibility → Spoken Content",
            "Click 'System Voice' dropdown",
            "Select 'Customize...'",
            "Download British English voices like 'Daniel (UK)' or 'Kate (UK)'",
            "Restart your browser after installation"
          ],
          alternativeSteps: [
            "Alternative: System Preferences → Speech",
            "Select 'Text to Speech' tab",
            "Choose a British English voice from the dropdown"
          ]
        };

      case 'android':
        return {
          title: "Install British English Voice on Android",
          steps: [
            "Open Settings",
            "Go to Accessibility → Text-to-speech output",
            "Tap on Google Text-to-speech Engine",
            "Tap 'Install voice data'",
            "Select 'English (United Kingdom)'",
            "Download the voice pack",
            "Refresh this page after installation"
          ],
          alternativeSteps: [
            "Alternative: Install Google Text-to-speech from Play Store",
            "Open the app and download British English voices"
          ]
        };

      case 'ios':
        return {
          title: "Install British English Voice on iOS",
          steps: [
            "Open Settings",
            "Go to Accessibility → Spoken Content",
            "Tap 'Voices'",
            "Select 'English'",
            "Download British English voices (e.g., 'Daniel (UK)')",
            "Return to SpellSAN and refresh"
          ],
          alternativeSteps: [
            "Alternative: Settings → General → Accessibility → Speech",
            "Select 'Voices' and download British English options"
          ]
        };

      default:
        return {
          title: "Install British English Voice",
          steps: [
            "Check your system's accessibility or speech settings",
            "Look for Text-to-Speech or Voice options",
            "Download or enable British English (en-GB) voices",
            "Common voice names: Daniel, Kate, Hazel, George",
            "Restart your browser after installation"
          ],
          alternativeSteps: []
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{instructions.title}</h2>
                <p className="text-slate-600">Required for proper British pronunciation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Why it's important */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Why British English Voice?</h3>
                <p className="text-amber-700 text-sm">
                  The SAN spelling competition uses British English pronunciation. Having the correct voice installed
                  ensures you practice with the same accent and pronunciation you&apos;ll hear in the actual competition.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Follow these steps:</span>
              </h3>
              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-slate-600">{index + 1}</span>
                    </div>
                    <p className="text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {instructions.alternativeSteps.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Alternative method:</span>
                </h3>
                <div className="space-y-3">
                  {instructions.alternativeSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-green-600">{index + 1}</span>
                      </div>
                      <p className="text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              I&apos;ve installed it - Refresh Page
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
            >
              Continue Without
            </button>
          </div>

          {/* Help note */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Need help? The voice installation may take a few minutes and requires a browser restart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSetupGuide;
