
import { Link } from "react-router-dom";
import { BrainCircuit, Check, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-therapy-offwhite">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-therapy-purple flex items-center justify-center">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-therapy-gray">MindfulPro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-therapy-gray hover:text-therapy-purple transition-colors">
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-therapy-purple hover:bg-therapy-purpleDeep text-white px-4 py-2 rounded-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-therapy-gray mb-6 leading-tight animate-fade-in">
            Empower Your Therapy Practice with Intelligent Insights
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            AI-powered tools for therapists to track client progress, 
            generate therapy insights, and enhance treatment outcomes.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link 
              to="/register" 
              className="bg-therapy-purple hover:bg-therapy-purpleDeep text-white px-8 py-3 rounded-md text-lg transition-colors flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link 
              to="/login" 
              className="bg-therapy-blue hover:bg-blue-200 text-therapy-gray px-8 py-3 rounded-md text-lg transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-therapy-gray mb-12">Features Designed for Mental Health Professionals</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="therapy-card">
              <div className="w-12 h-12 bg-therapy-purpleLight rounded-full flex items-center justify-center mb-4">
                <BrainCircuit size={24} className="text-therapy-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-therapy-gray">Therapy Insights</h3>
              <p className="text-gray-600 mb-4">
                Generate structured insights based on different therapy modalities like CBT, DBT, EMDR, and more.
              </p>
              <ul className="space-y-2">
                {["Key themes and patterns", "Cognitive distortions", "AI-generated recommendations"].map((item) => (
                  <li key={item} className="flex items-center text-gray-600">
                    <Check size={16} className="text-therapy-purple mr-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="therapy-card">
              <div className="w-12 h-12 bg-therapy-purpleLight rounded-full flex items-center justify-center mb-4">
                <LineChart size={24} className="text-therapy-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-therapy-gray">Progress Tracking</h3>
              <p className="text-gray-600 mb-4">
                Monitor client progress with visual charts, attendance rates, and milestone achievements.
              </p>
              <ul className="space-y-2">
                {["Session-wise progress charts", "Attendance tracking", "Exportable PDF reports"].map((item) => (
                  <li key={item} className="flex items-center text-gray-600">
                    <Check size={16} className="text-therapy-purple mr-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="therapy-card">
              <div className="w-12 h-12 bg-therapy-purpleLight rounded-full flex items-center justify-center mb-4">
                <FileText size={24} className="text-therapy-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-therapy-gray">Session Management</h3>
              <p className="text-gray-600 mb-4">
                Create, edit and manage session notes with customizable templates for different therapy approaches.
              </p>
              <ul className="space-y-2">
                {["Voice transcription", "Template library", "HIPAA compliant"].map((item) => (
                  <li key={item} className="flex items-center text-gray-600">
                    <Check size={16} className="text-therapy-purple mr-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-therapy-purpleLight">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-therapy-gray mb-6">Ready to transform your therapy practice?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of therapists who are enhancing their practice with MindfulPro.
          </p>
          <Link 
            to="/register" 
            className="bg-therapy-purple hover:bg-therapy-purpleDeep text-white px-8 py-3 rounded-md text-lg inline-flex items-center justify-center gap-2"
          >
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-therapy-purple flex items-center justify-center">
                <BrainCircuit size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl text-therapy-gray">MindfulPro</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 MindfulPro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
