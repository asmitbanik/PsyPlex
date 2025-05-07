import Meyda from "meyda";
import { voiceProfileService, VoiceProfile as StoredVoiceProfile } from "@/services/voiceProfileService";

type MFCCProfile = number[];

interface SpeechClassifier {
  userAProfile: MFCCProfile | null;
  threshold: number;
}

export class SpeechToTextClassifier implements SpeechClassifier {
  userAProfile: MFCCProfile | null = null;
  threshold: number = 0.1;
  private userId: string | null = null;

  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private source: MediaStreamAudioSourceNode;
  private meyda: any;

  constructor(stream: MediaStream, userId?: string) {
    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.source.connect(this.analyser);
    this.userId = userId || null;

    this.meyda = Meyda.createMeydaAnalyzer({
      audioContext: this.audioContext,
      source: this.source,
      bufferSize: 512,
      featureExtractors: ["mfcc"],
    });
  }

  async initialize(): Promise<void> {
    if (this.userId) {
      const storedProfile = await voiceProfileService.getVoiceProfile(this.userId);
      if (storedProfile) {
        this.userAProfile = storedProfile.mfccProfile;
      }
    }
  }

  async captureUserAProfile(duration: number = 5000): Promise<void> {
    return new Promise((resolve) => {
      const mfccs: number[][] = [];
      const interval = setInterval(() => {
        const features = this.meyda.get("mfcc");
        if (features) mfccs.push(features);
      }, 100);

      setTimeout(async () => {
        clearInterval(interval);
        this.userAProfile = this.averageFeatures(mfccs);
        
        // Save the profile if we have a userId
        if (this.userId && this.userAProfile) {
          try {
            await voiceProfileService.saveVoiceProfile(this.userId, this.userAProfile);
          } catch (error) {
            console.error('Failed to save voice profile:', error);
          }
        }
        
        resolve();
      }, duration);
    });
  }

  classifyCurrentSpeaker(): Promise<"UserA" | "UserB"> {
    return new Promise((resolve) => {
      const features = this.meyda.get("mfcc");
      if (!features || !this.userAProfile) {
        resolve("UserB");
        return;
      }

      const distance = this.euclideanDistance(this.userAProfile, features);
      resolve(distance < this.threshold ? "UserA" : "UserB");
    });
  }

  private averageFeatures(features: number[][]): number[] {
    const length = features[0].length;
    const sums = new Array(length).fill(0);
    for (const vec of features) {
      for (let i = 0; i < length; i++) {
        sums[i] += vec[i];
      }
    }
    return sums.map((s) => s / features.length);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0));
  }
} 