import { AudioAnalyzerProvider } from "./components/AudioContextProvider";
import TunerComponent from "./components/TunerComponent";

export default function Home() {
  return (
    <AudioAnalyzerProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-3l font-bold text-center mb-8">
          Sound Testing Station
        </h1>
        <TunerComponent />
      </div>
    </AudioAnalyzerProvider>
  );
}
